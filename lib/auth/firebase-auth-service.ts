import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import type { AppUser, UserProfileDoc } from '@/types';
import { auth, db } from '@/lib/firebase/firebaseConfig';
import type { AuthService } from './auth-service';

function mapFirebaseUserToAppUser(user: User, sharedGroupId: string | null): AppUser {
  return {
    uid: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? user.email?.split('@')[0] ?? 'User',
    photoURL: user.photoURL,
    activeGroupId: sharedGroupId,
    sharedGroupId,
  };
}

async function ensureUserProfile(user: User): Promise<AppUser> {
  const ref = doc(db, 'users', user.uid);
  const existing = await getDoc(ref);
  const now = new Date().toISOString();

  if (existing.exists()) {
    const data = existing.data() as Partial<UserProfileDoc>;
    return {
      uid: user.uid,
      email: user.email ?? data.email ?? '',
      displayName: data.displayName ?? user.displayName ?? user.email?.split('@')[0] ?? 'User',
      photoURL: data.photoURL ?? user.photoURL ?? null,
      activeGroupId: data.activeGroupId ?? data.sharedGroupId ?? null,
      sharedGroupId: data.sharedGroupId ?? data.activeGroupId ?? null,
    };
  }

  const profile: UserProfileDoc = {
    uid: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? user.email?.split('@')[0] ?? 'User',
    photoURL: user.photoURL ?? null,
    activeGroupId: null,
    sharedGroupId: null,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(ref, {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return mapFirebaseUserToAppUser(user, profile.activeGroupId ?? null);
}

export const firebaseAuthService: AuthService = {
  async signIn(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return ensureUserProfile(cred.user);
  },

  async register(email, password, displayName) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    return ensureUserProfile(cred.user);
  },

  async sendPasswordReset(email) {
    await sendPasswordResetEmail(auth, email);
  },

  async signOut() {
    await firebaseSignOut(auth);
  },

  async getSession() {
    const user = auth.currentUser;
    if (!user) return null;
    return ensureUserProfile(user);
  },

  subscribe(listener) {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        listener(null);
        return;
      }
      const appUser = await ensureUserProfile(user);
      listener(appUser);
    });
  },
};
