import type { IVendorQueries } from '@ecomerece/contracts';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { createMiddleware } from 'hono/factory';
import { ForbiddenError } from '../errors/app-error';

let vendorQueries: IVendorQueries | null = null;

/** Wired once by the application composition root. */
export function configureVendorQueries(queries: IVendorQueries): void {
  vendorQueries = queries;
}

/**
 * Protects vendor-owned actions: the caller must have the vendor role and
 * must own an active (verified, non-deleted) vendor. Admins use their own
 * routes instead and are not granted access here.
 */
export const vendorMiddleware = createMiddleware(async (c, next) => {
  const role = c.get('role');

  if (role !== 'vendor') {
    throw new ForbiddenError('Vendor access is required for this action.');
  }

  if (!vendorQueries) {
    throw new Error('Vendor queries are not configured.');
  }

  const userId = c.get('userId');
  if (!userId) {
    throw new ForbiddenError('Vendor access is required for this action.');
  }

  const vendor = await vendorQueries.ensureActiveByUserId(Id.create(userId));
  if (!vendor.vendor || !vendor.active) {
    throw new ForbiddenError('You do not own an active vendor.');
  }

  c.set('vendorId', vendor.vendor.id);
  await next();
});
