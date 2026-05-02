import { doc, getDoc } from 'firebase/firestore';

import { getFirebaseDb } from '@/lib/firebase/firebaseConfig';
import type { AppUser } from '@/types';

const seen = new Set<string>();

function toErrInfo(error: unknown): { code: string; message: string } {
  const err = error as { code?: string; message?: string };
  return {
    code: err?.code ?? 'unknown',
    message: err?.message ?? String(error),
  };
}

/**
 * Debug helper to explain permission-denied root causes in one place.
 * We intentionally run this only once per user+group context to avoid spam.
 */
export async function logAuthDiagnostics(user: AppUser | null): Promise<void> {
  if (!user?.uid || !user.activeGroupId) return;

  const contextKey = `${user.uid}:${user.activeGroupId}`;
  if (seen.has(contextKey)) return;
  seen.add(contextKey);

  const db = getFirebaseDb();
  const userRef = doc(db, 'users', user.uid);
  const groupRef = doc(db, 'groups', user.activeGroupId);

  let userDocReadable = false;
  let groupDocReadable = false;
  let userDocData: unknown = null;
  let groupDocData: unknown = null;
  let userDocError: { code: string; message: string } | null = null;
  let groupDocError: { code: string; message: string } | null = null;

  try {
    const snap = await getDoc(userRef);
    userDocReadable = true;
    userDocData = snap.exists() ? snap.data() : null;
  } catch (error) {
    userDocError = toErrInfo(error);
  }

  try {
    const snap = await getDoc(groupRef);
    groupDocReadable = true;
    groupDocData = snap.exists() ? snap.data() : null;
  } catch (error) {
    groupDocError = toErrInfo(error);
  }

  console.info('[auth:diagnostics]', {
    uid: user.uid,
    activeGroupId: user.activeGroupId,
    userDocReadable,
    userDocError,
    userDocData,
    groupDocReadable,
    groupDocError,
    groupDocData,
  });
}
