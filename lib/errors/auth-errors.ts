import type { TranslationKey } from '@/constants/i18n';

type FirebaseLikeError = {
  code?: string;
};

export function getAuthErrorKey(error: unknown): TranslationKey {
  const code = (error as FirebaseLikeError)?.code ?? '';

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'errors.auth.invalidCredentials';
    case 'auth/user-not-found':
      return 'errors.auth.userNotFound';
    case 'auth/email-already-in-use':
      return 'errors.auth.emailInUse';
    case 'auth/weak-password':
      return 'errors.auth.weakPassword';
    case 'auth/invalid-email':
      return 'errors.auth.invalidEmail';
    case 'auth/too-many-requests':
      return 'errors.auth.tooManyRequests';
    case 'auth/network-request-failed':
      return 'errors.auth.network';
    default:
      return 'errors.auth.default';
  }
}
