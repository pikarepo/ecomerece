import { resolve } from 'node:path';

type AuthMode = 'none' | 'refresh';
type Target = 'local' | 'staging';

/** Mirrors `E2ERole`; duplicated because roles.ts imports this module. */
const roleKeys = ['buyer', 'vendor', 'admin', 'buyerAlt', 'vendorAlt', 'adminAlt'] as const;
type ConfiguredRole = (typeof roleKeys)[number];

const primaryRoleKeys = new Set<ConfiguredRole>(['buyer', 'vendor', 'admin']);

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

const envKeyFor = (prefix: string, role: ConfiguredRole): string =>
  `${prefix}_${role.replaceAll(/[A-Z]/g, (letter) => `_${letter}`).toUpperCase()}`;

/**
 * `E2E_API_TOKEN` remains a convenience for the primary roles only. Secondary
 * roles never inherit it: a shared token would silently collapse two tenants
 * into one identity and void every cross-tenant assertion.
 */
const buildApiTokens = (): Record<ConfiguredRole, string | undefined> =>
  Object.fromEntries(
    roleKeys.map((role) => {
      const explicit = readOptional(envKeyFor('E2E_API_TOKEN', role));
      const fallback = primaryRoleKeys.has(role) ? readOptional('E2E_API_TOKEN') : undefined;
      return [role, explicit ?? fallback];
    }),
  ) as Record<ConfiguredRole, string | undefined>;

const buildRefreshTokens = (): Record<ConfiguredRole, string | undefined> => {
  const tokens = Object.fromEntries(
    roleKeys.map((role) => [role, readOptional(envKeyFor('E2E_SUPABASE_REFRESH_TOKEN', role))]),
  ) as Record<ConfiguredRole, string | undefined>;
  tokens.buyer ??= readOptional('E2E_SUPABASE_REFRESH_TOKEN');
  return tokens;
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
  apiTokens: buildApiTokens(),
  refreshTokens: buildRefreshTokens(),
  apiToken: readOptional('E2E_API_TOKEN'),
  mongoURI: readOptional('E2E_MONGO_URI') ?? readOptional('MONGO_URI'),
  allowIrreversibleWrites: process.env.E2E_ALLOW_IRREVERSIBLE_WRITES === 'true',
  authDir: resolve(process.cwd(), readOptional('E2E_AUTH_DIR') ?? 'apps/e2e/.auth'),
} as const;

export type { ConfiguredRole };
