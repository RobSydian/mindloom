import type { AppUser } from '@/types';
import { getConfiguredAuthService } from '@/lib/auth';
import { hasFirebaseEnvConfig } from '@/lib/firebase/config';
import type { ImpressionsService } from './impressions-service';
import { mockImpressionsService } from './mock-impressions-service';

export function getConfiguredImpressionsService(user: AppUser | null): ImpressionsService {
  const authProvider = getConfiguredAuthService().provider;
  const canUseFirebase = hasFirebaseEnvConfig();

  if (authProvider === 'firebase' && canUseFirebase && user) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { firebaseImpressionsService } = require('./firebase-impressions-service');
    return firebaseImpressionsService as ImpressionsService;
  }

  return mockImpressionsService;
}
