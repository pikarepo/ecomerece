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
 * Protects vendor-owned actions.
 *
 * The credential is the authenticated user's own vendor record, not a role
 * string: any signed-in user who owns an active (verified, non-deleted) vendor
 * may act for it, and everyone else is refused. The vendor id resolved here is
 * the only vendor the handlers may touch; each use case re-checks ownership of
 * the concrete resource before mutating it.
 */
export const vendorMiddleware = createMiddleware(async (c, next) => {
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
