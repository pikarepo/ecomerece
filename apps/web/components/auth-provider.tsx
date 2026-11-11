'use client';

import { authAdapter } from '@ecomerece/frontend/auth';
import { userService } from '@ecomerece/frontend/user';
import type { UserResponseReadModel } from '@ecomerece/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createContext, type ReactNode, useCallback, useContext } from 'react';

const AUTH_QUERY_KEY = ['auth', 'session'];

type AuthProfile = Partial<UserResponseReadModel>;

type AuthSession = {
  profile: AuthProfile | null;
  me: UserResponseReadModel | null;
};

type AuthContextValue = {
  user: UserResponseReadModel | null;
  role: UserResponseReadModel['role'] | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const sessionQuery = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async (): Promise<AuthSession | null> => {
      await authAdapter.ensureReady();
      const token = await authAdapter.getToken();
      if (!token) return null;

      const profile = await authAdapter.getUser();
      if (!profile) return null;

      try {
        const me = await userService.getMe();
        return { profile, me };
      } catch {
        return { profile, me: null };
      }
    },
    staleTime: 60_000,
    retry: false,
  });

  const signIn = useCallback(async () => {
    await authAdapter.signInWithGoogle();
  }, []);

  const signOut = useCallback(async () => {
    await authAdapter.signOut();
    queryClient.setQueryData(AUTH_QUERY_KEY, null);
    queryClient.clear();
    router.replace('/');
    router.refresh();
  }, [queryClient, router]);

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
  }, [queryClient]);

  const session = sessionQuery.data ?? null;

  return (
    <AuthContext.Provider
      value={{
        user: session?.me ?? null,
        role: session?.me?.role,
        isLoading: sessionQuery.isPending,
        isAuthenticated: Boolean(session),
        signIn,
        signOut,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider.');
  return value;
}
