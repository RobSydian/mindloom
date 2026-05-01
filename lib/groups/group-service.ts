import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import type { Group } from '@/types';
import { getFirebaseDb } from '@/lib/firebase/firebaseConfig';
import { setActiveGroupId } from '@/lib/users/user-service';

function makeGroupId(): string {
  return `grp_${Math.random().toString(36).slice(2, 10)}`;
}

export async function createGroup(
  ownerUid: string,
  name: string
): Promise<Group> {
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

export async function addMemberToGroup(groupId: string, uid: string): Promise<void> {
  const db = getFirebaseDb();
  const ref = doc(db, 'groups', groupId);
  await updateDoc(ref, {
    memberIds: arrayUnion(uid),
    updatedAt: serverTimestamp(),
  });
  await setActiveGroupId(uid, groupId);
}

export async function listGroupsForUser(uid: string): Promise<Group[]> {
  const db = getFirebaseDb();
  const q = query(collection(db, 'groups'), where('memberIds', 'array-contains', uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Group, 'id'>) }));
}
