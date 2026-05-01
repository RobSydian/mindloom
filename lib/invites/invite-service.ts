import * as Crypto from 'expo-crypto';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore';
import type { GroupInvite } from '@/types';
import { getFirebaseDb } from '@/lib/firebase/firebaseConfig';
import { addMemberToGroup } from '@/lib/groups/group-service';

const INVITE_TTL_DAYS = 7;
const APP_JOIN_URL_BASE = 'mindloom://invite-accept';

function generateRawToken(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}

async function sha256(value: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, value);
}

function toIsoAfterDays(days: number): string {
  const now = new Date();
  now.setDate(now.getDate() + days);
  return now.toISOString();
}

function toMillis(value: unknown): number {
  if (!value) return NaN;
  if (typeof value === 'string') return new Date(value).getTime();
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    const maybeTimestamp = value as { toDate: () => Date };
    return maybeTimestamp.toDate().getTime();
  }
  return NaN;
}

export interface CreateInviteInput {
  groupId: string;
  inviteeEmail: string;
  createdBy: string;
}

export interface CreatedInviteResult {
  invite: GroupInvite;
  rawToken: string;
  deepLink: string;
  mailtoLink: string;
}

export async function createGroupInvite(input: CreateInviteInput): Promise<CreatedInviteResult> {
  const db = getFirebaseDb();
  const rawToken = generateRawToken();
  const tokenHash = await sha256(rawToken);
  const emailLower = input.inviteeEmail.trim().toLowerCase();
  const inviteId = `inv_${Math.random().toString(36).slice(2, 10)}`;
  const expiresAt = toIsoAfterDays(INVITE_TTL_DAYS);
  const createdAt = new Date().toISOString();

  const invite: GroupInvite = {
    id: inviteId,
    groupId: input.groupId,
    emailLower,
    role: 'member',
    status: 'pending',
    tokenHash,
    expiresAt,
    createdBy: input.createdBy,
    createdAt,
    acceptedBy: null,
    acceptedAt: null,
  };

  await setDoc(doc(db, 'groupInvites', inviteId), {
    ...invite,
    createdAt: serverTimestamp(),
    expiresAt: Timestamp.fromDate(new Date(expiresAt)),
  });

  const deepLink = `${APP_JOIN_URL_BASE}?inviteId=${encodeURIComponent(
    inviteId
  )}&token=${encodeURIComponent(rawToken)}&email=${encodeURIComponent(emailLower)}`;

  const subject = encodeURIComponent('Join my Mindloom group');
  const body = encodeURIComponent(
    `I invited you to my Mindloom group.\n\nOpen this link to join:\n${deepLink}\n\nThis invite expires in ${INVITE_TTL_DAYS} days.`
  );
  const mailtoLink = `mailto:${encodeURIComponent(emailLower)}?subject=${subject}&body=${body}`;

  return { invite, rawToken, deepLink, mailtoLink };
}

export async function findPendingInvitesForEmail(email: string): Promise<GroupInvite[]> {
  const db = getFirebaseDb();
  const q = query(
    collection(db, 'groupInvites'),
    where('emailLower', '==', email.trim().toLowerCase()),
    where('status', '==', 'pending'),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<GroupInvite, 'id'>) }));
}

export interface AcceptInviteInput {
  inviteId: string;
  rawToken: string;
  userUid: string;
  userEmail: string;
}

export async function acceptGroupInvite(input: AcceptInviteInput): Promise<string> {
  const db = getFirebaseDb();
  const inviteRef = doc(db, 'groupInvites', input.inviteId);

  const inviteSnap = await getDoc(inviteRef);
  if (!inviteSnap.exists()) throw new Error('Invite not found.');
  const invite = inviteSnap.data() as Omit<GroupInvite, 'id'>;

  if (invite.status !== 'pending') throw new Error('Invite is no longer valid.');
  if (invite.emailLower !== input.userEmail.trim().toLowerCase()) {
    throw new Error('This invite was issued for a different email.');
  }
  if (toMillis(invite.expiresAt) < Date.now()) {
    throw new Error('Invite has expired.');
  }
  const hash = await sha256(input.rawToken);
  if (hash !== invite.tokenHash) {
    throw new Error('Invalid invite token.');
  }

  await runTransaction(db, async (txn) => {
    const snapshot = await txn.get(inviteRef);
    if (!snapshot.exists()) throw new Error('Invite not found.');
    const fresh = snapshot.data() as Omit<GroupInvite, 'id'>;
    if (fresh.status !== 'pending') throw new Error('Invite is no longer valid.');

    txn.update(inviteRef, {
      status: 'accepted',
      acceptedBy: input.userUid,
      acceptedAt: serverTimestamp(),
    });
  });

  await addMemberToGroup(invite.groupId, input.userUid);
  return invite.groupId;
}
