import { createMiddleware } from 'hono/factory';
import { UnauthorizedError } from '../errors/app-error';
import { getBearerToken } from '../lib/getBearerToken';
import { supabaseAdmin } from '../lib/supabase';

export const initAuthMiddleware = createMiddleware(async (c, next) => {
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

  c.set('email', email);
  c.set('userId', userId);

  await next();
});
