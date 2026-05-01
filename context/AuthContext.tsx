import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AppUser, AuthProvider } from '@/types';
import { getConfiguredAuthService } from '@/lib/auth';

interface AuthContextValue {
  user: AppUser | null;
  isLoading: boolean;
  provider: AuthProvider;
  providerReason: string;
  signIn: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [provider, setProvider] = useState<AuthProvider>('mock');
  const [providerReason, setProviderReason] = useState('Not initialized yet.');

  useEffect(() => {
    const configured = getConfiguredAuthService();
    setProvider(configured.provider);
    setProviderReason(configured.reason);

    configured.service
      .getSession()
      .then(setUser)
      .finally(() => setIsLoading(false));

    const unsubscribe = configured.service.subscribe(setUser);
    return unsubscribe;
  }, []);

  async function signIn(email: string, password: string) {
    const configured = getConfiguredAuthService();
    const authedUser = await configured.service.signIn(email, password);
    setUser(authedUser);
  }

  async function signOut() {
    const configured = getConfiguredAuthService();
    await configured.service.signOut();
    setUser(null);
  }

  async function register(email: string, password: string, displayName: string) {
    const configured = getConfiguredAuthService();
    const authedUser = await configured.service.register(email, password, displayName);
    setUser(authedUser);
  }

  async function sendPasswordReset(email: string) {
    const configured = getConfiguredAuthService();
    await configured.service.sendPasswordReset(email);
  }

  async function refreshUser() {
    const configured = getConfiguredAuthService();
    const session = await configured.service.getSession();
    setUser(session);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        provider,
        providerReason,
        signIn,
        register,
        sendPasswordReset,
        refreshUser,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
