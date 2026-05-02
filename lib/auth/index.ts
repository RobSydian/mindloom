import type { AuthProvider } from '@/types';
import { getFirebaseEnvValidationErrors, hasFirebaseEnvConfig } from '@/lib/firebase/config';
import type { AuthServiceSelection } from './auth-service';
import { mockAuthService } from './mock-auth-service';

function normalizeProvider(input: string | undefined): AuthProvider | null {
  if (!input) return null;
  if (input === 'firebase') return 'firebase';
  if (input === 'mock') return 'mock';
  return null;
}

export function getConfiguredAuthService(): AuthServiceSelection {
  const requested = normalizeProvider(process.env.EXPO_PUBLIC_AUTH_PROVIDER);
  const canUseFirebase = hasFirebaseEnvConfig();

  function loadFirebaseSelection(
    reasonWhenLoaded: string,
    fallbackReasonPrefix: string
  ): AuthServiceSelection {
    try {
      // Lazy require avoids initializing Firebase in mock mode.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { firebaseAuthService } = require('./firebase-auth-service');
      return {
        provider: 'firebase',
        service: firebaseAuthService,
        reason: reasonWhenLoaded,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        provider: 'mock',
        service: mockAuthService,
        reason: `${fallbackReasonPrefix} Falling back to mock auth. Root cause: ${message}`,
      };
    }
  }

  if (requested === 'firebase' && canUseFirebase) {
    return loadFirebaseSelection(
      'EXPO_PUBLIC_AUTH_PROVIDER=firebase with complete Firebase env config.',
      'Requested Firebase auth, but Firebase initialization failed.'
    );
  }

  if (requested === 'firebase' && !canUseFirebase) {
    return {
      provider: 'mock',
      service: mockAuthService,
      reason: `Requested Firebase auth but missing env keys: ${getFirebaseEnvValidationErrors().join(
        ', '
      )}`,
    };
  }

  if (!requested && canUseFirebase) {
    return loadFirebaseSelection(
      'Auto-selected Firebase because config is present.',
      'Auto-selected Firebase, but Firebase initialization failed.'
    );
  }

  return {
    provider: 'mock',
    service: mockAuthService,
    reason: 'Using mock provider by default.',
  };
}
