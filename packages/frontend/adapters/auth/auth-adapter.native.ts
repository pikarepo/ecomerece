import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase as defaultSupabase } from '../../services/supabaseClient';
import type { AuthAdapter, AuthUser } from './auth-adapter.interface';

class SupabaseNativeAuthAdapter implements AuthAdapter {
  private supabase: SupabaseClient;
  private hasSession: boolean = false;
  private readyPromise: Promise<void>;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;

    this.readyPromise = this.supabase.auth
      .getSession()
      .then(({ data }) => {
        this.hasSession = Boolean(data.session);
      })
      .catch(() => {
        this.hasSession = false;
      });

    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.hasSession = Boolean(session);
    });
  }

  public async ensureReady(): Promise<void> {
    await this.readyPromise;
  }

  isSignedIn(): boolean {
    return this.hasSession;
  }

  async getUser(): Promise<Partial<AuthUser> | null> {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser();
    if (error || !user) return null;

    const metadata = user.user_metadata ?? {};
    return {
      id: user.id,
      email: user.email ?? '',
      fullName: metadata.full_name ?? metadata.name ?? '',
    };
  }

  async signInWithGoogle(): Promise<void> {
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) throw error;
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  async getToken(): Promise<string | null> {
    const {
      data: { session },
      error,
    } = await this.supabase.auth.getSession();

    if (error || !session) return null;
    return session.access_token;
  }

  async isTokenValid(): Promise<boolean> {
    const token = await this.getToken();
    if (!token) return false;
    return !(await this.isExpired());
  }

  async isExpired(): Promise<boolean> {
    const {
      data: { session },
      error,
    } = await this.supabase.auth.getSession();
    if (error || !session) return true;

    const expiresAt = session.expires_at;
    if (!expiresAt) return true;

    return expiresAt * 1000 <= Date.now();
  }
}

export const authAdapter: AuthAdapter = new SupabaseNativeAuthAdapter(defaultSupabase);
