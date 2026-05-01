import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppUser } from '@/types';

const SESSION_KEY = '@mindloom/session';

const MOCK_USERS: Array<AppUser & { password: string }> = [
  {
    uid: 'user_01',
    email: 'alex@mindloom.app',
    displayName: 'Alex',
    photoURL: null,
    activeGroupId: 'group_01',
    sharedGroupId: 'group_01',
    password: 'password',
  },
  {
    uid: 'user_02',
    email: 'sam@mindloom.app',
    displayName: 'Sam',
    photoURL: null,
    activeGroupId: 'group_01',
    sharedGroupId: 'group_01',
    password: 'password',
  },
];

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

export async function mockSignIn(
  email: string,
  password: string
): Promise<AppUser> {
  await delay();
  const match = MOCK_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!match) throw new Error('Invalid email or password.');
  const { password: _p, ...user } = match;
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export async function mockSignOut(): Promise<void> {
  await delay(200);
  await AsyncStorage.removeItem(SESSION_KEY);
}

export async function mockRegister(
  email: string,
  password: string,
  displayName: string
): Promise<AppUser> {
  await delay();
  const exists = MOCK_USERS.some((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) throw new Error('An account with this email already exists.');

  const user: AppUser & { password: string } = {
    uid: `user_${Date.now()}`,
    email: email.toLowerCase(),
    displayName: displayName || email.split('@')[0],
    photoURL: null,
    activeGroupId: null,
    sharedGroupId: null,
    password,
  };
  MOCK_USERS.push(user);
  const { password: _p, ...publicUser } = user;
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(publicUser));
  return publicUser;
}

export async function mockSendPasswordReset(email: string): Promise<void> {
  await delay(250);
  const exists = MOCK_USERS.some((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!exists) {
    // Mirror Firebase behavior: do not reveal account existence.
    return;
  }
}

export async function mockGetSession(): Promise<AppUser | null> {
  await delay(100);
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as AppUser;
}
