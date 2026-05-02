import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import type { Group, LoomJoinRequest } from '@/types';
import { getFirebaseDb } from '@/lib/firebase/firebaseConfig';
import { setActiveGroupId } from '@/lib/users/user-service';

export const MAX_LOOMS_PER_USER = 5;

function makeGroupId(): string {
  return `grp_${Math.random().toString(36).slice(2, 10)}`;
}

export async function createGroup(ownerUid: string, name: string): Promise<Group> {
  const existing = await listGroupsForUser(ownerUid);
  if (existing.length >= MAX_LOOMS_PER_USER) {
    throw new Error('LOOM_LIMIT_REACHED');
  }

  const db = getFirebaseDb();
  const id = makeGroupId();
  const now = new Date().toISOString();
  const group: Group = {
    id,
    name: name.trim(),
    createdBy: ownerUid,
    memberIds: [ownerUid],
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(db, 'groups', id), {
    ...group,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await setActiveGroupId(ownerUid, id);
  return group;
}

export async function getGroup(groupId: string): Promise<Group | null> {
  const db = getFirebaseDb();
  const snap = await getDoc(doc(db, 'groups', groupId));
  if (!snap.exists()) return null;
  const data = snap.data() as Omit<Group, 'id'>;
  return { id: snap.id, ...data };
}

export async function addMemberToGroup(
  groupId: string,
  uid: string,
  options?: { setActiveForMember?: boolean }
): Promise<void> {
  const db = getFirebaseDb();
  const ref = doc(db, 'groups', groupId);
  await updateDoc(ref, {
    memberIds: arrayUnion(uid),
    updatedAt: serverTimestamp(),
  });
  if (options?.setActiveForMember !== false) {
    await setActiveGroupId(uid, groupId);
  }
}

export async function listGroupsForUser(uid: string): Promise<Group[]> {
  const db = getFirebaseDb();
  const q = query(collection(db, 'groups'), where('memberIds', 'array-contains', uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Group, 'id'>) }));
}

/** Request to join a Loom; creator must approve before membership is granted. */
export async function requestJoinLoom(requesterUid: string, groupId: string): Promise<void> {
  const db = getFirebaseDb();
  const trimmedId = groupId.trim();
  const groupSnap = await getDoc(doc(db, 'groups', trimmedId));
  if (!groupSnap.exists()) {
    throw new Error('LOOM_NOT_FOUND');
  }
  const group = groupSnap.data() as Omit<Group, 'id'>;
  if (group.memberIds?.includes(requesterUid)) {
    throw new Error('ALREADY_MEMBER');
  }

  const ref = doc(db, 'groups', trimmedId, 'joinRequests', requesterUid);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    const data = existing.data() as { status?: string };
    if (data.status === 'pending') {
      throw new Error('JOIN_REQUEST_PENDING');
    }
    await deleteDoc(ref);
  }

  const now = new Date().toISOString();
  await setDoc(ref, {
    requesterUid,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdAtIso: now,
  });
}

export async function listPendingJoinRequestsForCreator(
  uid: string
): Promise<{ group: Group; requesterUid: string }[]> {
  const groups = await listGroupsForUser(uid);
  const owned = groups.filter((g) => g.createdBy === uid);
  const out: { group: Group; requesterUid: string }[] = [];
  for (const g of owned) {
    const reqs = await listPendingJoinRequests(g.id);
    for (const r of reqs) {
      out.push({ group: g, requesterUid: r.requesterUid });
    }
  }
  return out;
}

export async function listPendingJoinRequests(
  groupId: string
): Promise<(LoomJoinRequest & { id: string })[]> {
  const db = getFirebaseDb();
  const q = query(
    collection(db, 'groups', groupId, 'joinRequests'),
    where('status', '==', 'pending')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as Record<string, unknown>;
    const requesterUid =
      typeof data.requesterUid === 'string' ? data.requesterUid : d.id;
    const createdAtIso = data.createdAtIso;
    return {
      id: d.id,
      requesterUid,
      status: 'pending' as const,
      createdAt: typeof createdAtIso === 'string' ? createdAtIso : '',
      updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : undefined,
    };
  });
}

export async function approveJoinRequest(groupId: string, requesterUid: string): Promise<void> {
  const db = getFirebaseDb();
  const ref = doc(db, 'groups', groupId, 'joinRequests', requesterUid);
  await addMemberToGroup(groupId, requesterUid, { setActiveForMember: false });
  await updateDoc(ref, {
    status: 'accepted',
    updatedAt: serverTimestamp(),
  });
}

export async function rejectJoinRequest(groupId: string, requesterUid: string): Promise<void> {
  const db = getFirebaseDb();
  const ref = doc(db, 'groups', groupId, 'joinRequests', requesterUid);
  await updateDoc(ref, {
    status: 'rejected',
    updatedAt: serverTimestamp(),
  });
}

export async function cancelJoinRequest(groupId: string, requesterUid: string): Promise<void> {
  const db = getFirebaseDb();
  const ref = doc(db, 'groups', groupId, 'joinRequests', requesterUid);
  await deleteDoc(ref);
}

/** Removes the user from a Loom. The creator cannot leave (manage ownership separately). */
export async function leaveLoom(uid: string, groupId: string): Promise<void> {
  const group = await getGroup(groupId);
  if (!group) throw new Error('LOOM_NOT_FOUND');
  if (group.createdBy === uid) {
    throw new Error('CREATOR_CANNOT_LEAVE');
  }
  if (!group.memberIds.includes(uid)) {
    throw new Error('NOT_A_MEMBER');
  }

  const db = getFirebaseDb();
  const groupRef = doc(db, 'groups', groupId);
  await updateDoc(groupRef, {
    memberIds: arrayRemove(uid),
    updatedAt: serverTimestamp(),
  });

  const profile = await getDoc(doc(db, 'users', uid));
  const data = profile.data() as { activeGroupId?: string | null } | undefined;
  if (data?.activeGroupId === groupId) {
    await setActiveGroupId(uid, null);
  }
}
