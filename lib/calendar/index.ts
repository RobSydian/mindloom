import type { AppUser } from '@/types';
import { getConfiguredAuthService } from '@/lib/auth';
import { hasFirebaseEnvConfig } from '@/lib/firebase/config';
import type { CalendarService } from './calendar-service';
import { mockCalendarService } from './mock-calendar-service';

export function getConfiguredCalendarService(user: AppUser | null): CalendarService {
  const authProvider = getConfiguredAuthService().provider;
  const canUseFirebase = hasFirebaseEnvConfig();
  if (authProvider === 'firebase' && canUseFirebase && user) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { firebaseCalendarService } = require('./firebase-calendar-service');
    return firebaseCalendarService as CalendarService;
  }
  return mockCalendarService;
}
