import type { AppUser, AuthProvider } from '@/types';

export interface AuthService {
  signIn(email: string, password: string): Promise<AppUser>;
  register(email: string, password: string, displayName: string): Promise<AppUser>;
  sendPasswordReset(email: string): Promise<void>;
  signOut(): Promise<void>;
  getSession(): Promise<AppUser | null>;
  subscribe(listener: (user: AppUser | null) => void): () => void;
}

export interface AuthServiceSelection {
  provider: AuthProvider;
  service: AuthService;
  reason: string;
}
