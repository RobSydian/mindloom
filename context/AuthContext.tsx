import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

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

  // Resolve the auth service once. Re-resolving on every callback caused redundant
  // Firebase init work and complicated reasoning about lifecycle ordering.
  const configured = useMemo(() => getConfiguredAuthService(), []);

  useEffect(() => {
    console.info(`[auth] provider=${configured.provider} reason=${configured.reason}`);

    let isMounted = true;
    const unsubscribe = configured.service.subscribe((nextUser) => {
      if (!isMounted) return;
      setUser(nextUser);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [configured]);

  async function signIn(email: string, password: string) {
    const authedUser = await configured.service.signIn(email, password);
    setUser(authedUser);
  }

  async function register(email: string, password: string, displayName: string) {
    const authedUser = await configured.service.register(email, password, displayName);
    setUser(authedUser);
  }

  async function signOut() {
    await configured.service.signOut();
    setUser(null);
  }

  async function sendPasswordReset(email: string) {
    await configured.service.sendPasswordReset(email);
  }

  async function refreshUser() {
    const session = await configured.service.getSession();
    setUser(session);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        provider: configured.provider,
        providerReason: configured.reason,
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
