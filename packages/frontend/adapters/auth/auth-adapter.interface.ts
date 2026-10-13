import type { UserResponseReadModel } from '@ecomerece/shared';

export type AuthUser = UserResponseReadModel;

export interface AuthAdapter {
  ensureReady(): Promise<void>;
  isSignedIn(): boolean;
  signInWithGoogle(): Promise<void>;
  getUser(): Promise<Partial<AuthUser> | null>;
  signOut(): Promise<void>;
  getToken(): Promise<string | null>;
  isTokenValid(): Promise<boolean>;
  isExpired(): Promise<boolean>;
}
