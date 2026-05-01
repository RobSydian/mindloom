import type { AppUser } from '@/types';
import { getConfiguredAuthService } from '@/lib/auth';
import { hasFirebaseEnvConfig } from '@/lib/firebase/config';
import type { GoalsService } from './goals-service';
import { mockGoalsService } from './mock-goals-service';

export function getConfiguredGoalsService(user: AppUser | null): GoalsService {
  const authProvider = getConfiguredAuthService().provider;
  const canUseFirebase = hasFirebaseEnvConfig();
  if (authProvider === 'firebase' && canUseFirebase && user) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { firebaseGoalsService } = require('./firebase-goals-service');
    return firebaseGoalsService as GoalsService;
  }
  return mockGoalsService;
}
