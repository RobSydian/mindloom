import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import type { AppUser, UserProfileDoc } from '@/types';
import { getFirebaseDb } from '@/lib/firebase/firebaseConfig';

function toAppUser(uid: string, data: Partial<UserProfileDoc>): AppUser {
  const activeGroupId = data.activeGroupId ?? data.sharedGroupId ?? null;
  return {
    uid,
    email: data.email ?? '',
    displayName: data.displayName ?? '',
    photoURL: data.photoURL ?? null,
    activeGroupId,
    sharedGroupId: activeGroupId,
  };
}

export async function getUserProfile(uid: string): Promise<AppUser | null> {
  const db = getFirebaseDb();
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return toAppUser(uid, snap.data() as Partial<UserProfileDoc>);
}

export async function upsertUserProfile(user: AppUser): Promise<AppUser> {
  const db = getFirebaseDb();
  const ref = doc(db, 'users', user.uid);
  const activeGroupId = user.activeGroupId ?? user.sharedGroupId ?? null;

  await setDoc(
    ref,
    {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      activeGroupId,
      sharedGroupId: activeGroupId,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  return { ...user, activeGroupId, sharedGroupId: activeGroupId };
}

export async function setActiveGroupId(uid: string, groupId: string | null): Promise<void> {
  const db = getFirebaseDb();
  const ref = doc(db, 'users', uid);
  await updateDoc(ref, {
    activeGroupId: groupId,
    sharedGroupId: groupId,
    updatedAt: serverTimestamp(),
  });
}
