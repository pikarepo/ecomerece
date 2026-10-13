import { createMiddleware } from 'hono/factory';
import { ForbiddenError, UnauthorizedError } from '../errors/app-error';
import { getBearerToken } from '../lib/getBearerToken';
import { supabaseAdmin } from '../lib/supabase';
import { UserModel } from '../modules/user/infrastructure/user.models';

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

  const user = await UserModel.findById(userId);

  if (!user || user.deleted?.deleted) {
    throw new UnauthorizedError('User not found.');
  }

  if (user.block?.blocked) {
    throw new ForbiddenError('This user account is blocked.');
  }

  if (user.ban?.banned) {
    throw new ForbiddenError('This user account is banned.');
  }

  c.set('email', email);
  c.set('user', user);
  c.set('userId', userId);
  c.set('role', user.role?.role);

  await next();
});
