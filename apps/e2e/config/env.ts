import { resolve } from 'node:path';

type AuthMode = 'none' | 'refresh';
type Target = 'local' | 'staging';

const readOptional = (key: string): string | undefined => {
  const value = process.env[key];
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

const readEnum = <T extends string>(key: string, allowed: readonly T[], fallback: T): T => {
  const value = readOptional(key);
  if (value === undefined) return fallback;
  const match = allowed.find((candidate) => candidate === value);
  if (match === undefined) {
    throw new Error(`${key} must be one of ${allowed.join(', ')}.`);
  }
  return match;
};

export const env = {
  authMode: readEnum('E2E_AUTH', ['none', 'refresh'] as const, 'none'),
  target: readEnum('E2E_TARGET', ['local', 'staging'] as const, 'local'),
  isCI: process.env.CI === 'true',
  baseURL: readOptional('E2E_BASE_URL') ?? 'http://localhost:3000',
  apiURL: readOptional('E2E_API_URL') ?? 'http://localhost:8000',
  supabaseURL: readOptional('E2E_SUPABASE_URL') ?? readOptional('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey:
    readOptional('E2E_SUPABASE_ANON_KEY') ?? readOptional('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  refreshTokens: {
    buyer:
      readOptional('E2E_SUPABASE_REFRESH_TOKEN_BUYER') ??
      readOptional('E2E_SUPABASE_REFRESH_TOKEN'),
    vendor: readOptional('E2E_SUPABASE_REFRESH_TOKEN_VENDOR'),
    admin: readOptional('E2E_SUPABASE_REFRESH_TOKEN_ADMIN'),
  },
  apiToken: readOptional('E2E_API_TOKEN'),
  authDir: resolve(process.cwd(), readOptional('E2E_AUTH_DIR') ?? 'apps/e2e/.auth'),
} as const;
