import { createMiddleware } from 'hono/factory';
import { ForbiddenError } from '../errors/app-error';

export const sellerMiddleware = createMiddleware(async (c, next) => {
  const profile = c.get('profile');

  if (profile.role !== 'seller') {
    throw new ForbiddenError('Seller access is required for this action.');
  }

  await next();
});
