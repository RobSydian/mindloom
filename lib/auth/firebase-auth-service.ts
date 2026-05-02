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
import { getFirebaseAuth, getFirebaseDb } from '@/lib/firebase/firebaseConfig';
import type { AuthService } from './auth-service';

/**
 * Read the user's profile doc and merge it with the Firebase auth identity.
 * If the doc doesn't exist yet (first sign-in), create a minimal one with no
 * activeGroupId — the app's group-onboarding flow will set that explicitly.
 *
 * IMPORTANT: this function never mutates a user's existing activeGroupId or
 * memberships. Auth must not silently rewrite identity/group state.
 */
async function ensureUserProfile(user: User): Promise<AppUser> {
  const db = getFirebaseDb();
  const ref = doc(db, 'users', user.uid);
  const existing = await getDoc(ref);

  if (existing.exists()) {
    const data = existing.data() as Partial<UserProfileDoc>;
    const activeGroupId = data.activeGroupId ?? data.sharedGroupId ?? null;
    return {
      uid: user.uid,
      email: user.email ?? data.email ?? '',
      displayName: data.displayName ?? user.displayName ?? user.email?.split('@')[0] ?? 'User',
      photoURL: data.photoURL ?? user.photoURL ?? null,
      activeGroupId,
      sharedGroupId: data.sharedGroupId ?? activeGroupId,
    };
  }

  const profile: UserProfileDoc = {
    uid: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? user.email?.split('@')[0] ?? 'User',
    photoURL: user.photoURL ?? null,
    activeGroupId: null,
    sharedGroupId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(ref, {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    uid: profile.uid,
    email: profile.email,
    displayName: profile.displayName,
    photoURL: profile.photoURL,
    activeGroupId: null,
    sharedGroupId: null,
  };
}

export const firebaseAuthService: AuthService = {
  async signIn(email, password) {
    const auth = getFirebaseAuth();
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return ensureUserProfile(cred.user);
  },

  async register(email, password, displayName) {
    const auth = getFirebaseAuth();
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    return ensureUserProfile(cred.user);
  },

  async sendPasswordReset(email) {
    const auth = getFirebaseAuth();
    await sendPasswordResetEmail(auth, email);
  },

  async signOut() {
    const auth = getFirebaseAuth();
    await firebaseSignOut(auth);
  },

  async getSession() {
    const auth = getFirebaseAuth();
    // Wait for AsyncStorage hydration so we never observe a stale "no user".
    await auth.authStateReady();
    const user = auth.currentUser;
    if (!user) return null;
    return ensureUserProfile(user);
  },

  subscribe(listener) {
    const auth = getFirebaseAuth();
    let isActive = true;

    // Wait for hydration before delivering the first event so consumers don't
    // briefly see "logged out" while AsyncStorage is still loading the token.
    const ready = auth.authStateReady();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        await ready;
      } catch {
        // authStateReady never rejects in practice, but be defensive.
      }
      if (!isActive) return;

      if (!user) {
        listener(null);
        return;
      }

      try {
        const appUser = await ensureUserProfile(user);
        if (!isActive) return;
        listener(appUser);
      } catch (error) {
        console.warn('[auth] failed to load user profile', error);
        // Surface the bare auth identity so UI can still render and the user
        // can try to recover (sign out, retry, etc).
        if (!isActive) return;
        listener({
          uid: user.uid,
          email: user.email ?? '',
          displayName: user.displayName ?? user.email?.split('@')[0] ?? 'User',
          photoURL: user.photoURL ?? null,
          activeGroupId: null,
          sharedGroupId: null,
        });
      }
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  },
};
