import { createMiddleware } from 'hono/factory';
import { ForbiddenError } from '../errors/app-error';

export const vendorMiddleware = createMiddleware(async (c, next) => {
    const role = c.get('role');

    if (role !== 'vendor') {
        throw new ForbiddenError('Vendor access is required for this action.');
    }

    await next();
});
