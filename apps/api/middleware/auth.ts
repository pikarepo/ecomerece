import type { IAuthUserLookup } from '@ecomerece/contracts';
import { createMiddleware } from 'hono/factory';
import { ForbiddenError, UnauthorizedError } from '../errors/app-error';
import { getBearerToken } from '../lib/getBearerToken';
import { supabaseAdmin } from '../lib/supabase';

let authUserLookup: IAuthUserLookup | null = null;

/** Wired once by the application composition root. */
export function configureAuthUserLookup(lookup: IAuthUserLookup): void {
  authUserLookup = lookup;
}

export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization');

  const token = getBearerToken(authHeader);

  if (!token) {
    throw new UnauthorizedError('An authentication token is required.');
  }

  // Verify the token securely via Supabase's server-side Auth API
  const {
    data: { user: supabaseUser },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !supabaseUser) {
    throw new UnauthorizedError('The provided token is invalid or has expired.');
  }

  const userId = String(supabaseUser.id);
  const email = String(supabaseUser.email);
  if (!userId) {
    throw new UnauthorizedError('The token payload is invalid.');
  }

  if (!authUserLookup) {
    throw new Error('Auth user lookup is not configured.');
  }

  const snapshot = await authUserLookup.findAuthUser(userId);

  if (!snapshot || snapshot.deleted) {
    throw new UnauthorizedError('User not found.');
  }

  if (snapshot.blocked) {
    throw new ForbiddenError('This user account is blocked.');
  }

  if (snapshot.banned) {
    throw new ForbiddenError('This user account is banned.');
  }

  c.set('email', email);
  c.set('user', snapshot.actor);
  c.set('userId', userId);
  c.set('role', snapshot.role);

  await next();
});
