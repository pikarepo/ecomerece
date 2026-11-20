import { z } from 'zod';
import { env } from '../config/env';

const sessionSchema = z
  .object({
    access_token: z.string().min(1),
    refresh_token: z.string().min(1),
    expires_in: z.number().int().positive(),
    expires_at: z.number().int().positive(),
    token_type: z.string().min(1),
    user: z.object({ id: z.string().min(1) }).passthrough(),
  })
  .passthrough();

export type SupabaseSession = z.infer<typeof sessionSchema>;

type AuthCookie = {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'Lax';
};

const BASE64_PREFIX = 'base64-';
const MAX_CHUNK_SIZE = 3000;

const projectRefFromURL = (url: string): string => {
  const host = new URL(url).hostname;
  const ref = host.split('.')[0] ?? '';
  if (ref === '') {
    throw new Error(`Unable to derive a Supabase project ref from ${url}.`);
  }
  return ref;
};

const createChunks = (key: string, value: string): Array<{ name: string; value: string }> => {
  if (value.length <= MAX_CHUNK_SIZE) return [{ name: key, value }];
  const chunks: Array<{ name: string; value: string }> = [];
  for (let index = 0; index < value.length; index += MAX_CHUNK_SIZE) {
    chunks.push({
      name: `${key}.${chunks.length}`,
      value: value.slice(index, index + MAX_CHUNK_SIZE),
    });
  }
  return chunks;
};

export const exchangeRefreshToken = async (refreshToken: string): Promise<SupabaseSession> => {
  if (env.supabaseURL === undefined || env.supabaseAnonKey === undefined) {
    throw new Error('E2E_AUTH=refresh requires E2E_SUPABASE_URL and E2E_SUPABASE_ANON_KEY.');
  }

  const response = await fetch(`${env.supabaseURL}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: {
      apikey: env.supabaseAnonKey,
      Authorization: `Bearer ${env.supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    throw new Error(`Supabase token refresh failed with status ${response.status}. ${detail}`);
  }

  const payload: unknown = await response.json();
  return sessionSchema.parse(payload);
};

export const buildAuthCookies = (session: SupabaseSession): AuthCookie[] => {
  if (env.supabaseURL === undefined) {
    throw new Error('E2E_AUTH=refresh requires E2E_SUPABASE_URL.');
  }

  const storageKey = `sb-${projectRefFromURL(env.supabaseURL)}-auth-token`;
  const encodedSession = `${BASE64_PREFIX}${Buffer.from(JSON.stringify(session), 'utf8').toString('base64url')}`;
  const domain = new URL(env.baseURL).hostname;

  return createChunks(storageKey, encodedSession).map(({ name, value }) => ({
    name,
    value,
    domain,
    path: '/',
    expires: session.expires_at,
    httpOnly: false,
    secure: env.baseURL.startsWith('https://'),
    sameSite: 'Lax',
  }));
};
