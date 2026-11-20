import { readStoredRefreshToken, writeRoleArtifacts } from './auth/artifacts';
import { roles, type E2ERole } from './auth/roles';
import { buildAuthCookies, exchangeRefreshToken } from './auth/session';
import { env } from './config/env';

const resolveRefreshToken = async (role: E2ERole): Promise<string | undefined> =>
  env.refreshTokens[role] ?? (await readStoredRefreshToken(role));

export default async function globalSetup(): Promise<void> {
  if (env.authMode === 'none') return;

  const buyerRefreshToken = await resolveRefreshToken('buyer');
  if (buyerRefreshToken === undefined) {
    throw new Error(
      'E2E_AUTH=refresh requires E2E_SUPABASE_REFRESH_TOKEN_BUYER or E2E_SUPABASE_REFRESH_TOKEN.',
    );
  }

  for (const role of roles) {
    const refreshToken = await resolveRefreshToken(role);
    if (refreshToken === undefined) continue;

    const session = await exchangeRefreshToken(refreshToken);
    await writeRoleArtifacts(
      role,
      { cookies: buildAuthCookies(session), origins: [] },
      session.access_token,
      session.refresh_token,
    );
  }
}
