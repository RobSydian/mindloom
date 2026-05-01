import {
  mockGetSession,
  mockRegister,
  mockSendPasswordReset,
  mockSignIn,
  mockSignOut,
} from '@/lib/mock/auth';
import type { AuthService } from './auth-service';

export const mockAuthService: AuthService = {
  signIn: mockSignIn,
  register: mockRegister,
  sendPasswordReset: mockSendPasswordReset,
  signOut: mockSignOut,
  getSession: mockGetSession,
  subscribe() {
    // Mock provider does not expose realtime auth state events.
    return () => {};
  },
};
