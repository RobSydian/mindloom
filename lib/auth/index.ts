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

  if (requested === 'firebase' && canUseFirebase) {
    // Lazy require avoids initializing Firebase in mock mode.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { firebaseAuthService } = require('./firebase-auth-service');
    return {
      provider: 'firebase',
      service: firebaseAuthService,
      reason: 'EXPO_PUBLIC_AUTH_PROVIDER=firebase with complete Firebase env config.',
    };
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
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { firebaseAuthService } = require('./firebase-auth-service');
    return {
      provider: 'firebase',
      service: firebaseAuthService,
      reason: 'Auto-selected Firebase because config is present.',
    };
  }

  return {
    provider: 'mock',
    service: mockAuthService,
    reason: 'Using mock provider by default.',
  };
}
