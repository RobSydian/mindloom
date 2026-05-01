export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

function readFirebaseConfig(): FirebaseClientConfig {
  return {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
  };
}

export function hasFirebaseEnvConfig(): boolean {
  const cfg = readFirebaseConfig();
  return Object.values(cfg).every((v) => Boolean(v));
}

export function getFirebaseEnvValidationErrors(): string[] {
  const cfg = readFirebaseConfig();
  const missing: string[] = [];
  if (!cfg.apiKey) missing.push('EXPO_PUBLIC_FIREBASE_API_KEY');
  if (!cfg.authDomain) missing.push('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN');
  if (!cfg.projectId) missing.push('EXPO_PUBLIC_FIREBASE_PROJECT_ID');
  if (!cfg.storageBucket) missing.push('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET');
  if (!cfg.messagingSenderId) missing.push('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
  if (!cfg.appId) missing.push('EXPO_PUBLIC_FIREBASE_APP_ID');
  return missing;
}

// Runtime Firebase app/auth/db access lives in `lib/firebase/firebaseConfig.ts`.
