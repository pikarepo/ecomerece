import type { IStatsAccessPort } from '@ecomerece/contracts';
import { ForbiddenError, NotFoundError } from '../errors/app-error';

/**
 * Owner/admin guard for revenue-sensitive stats reads.
 *
 * - Admin: always allowed.
 * - Vendor owner: can read stats for its own vendor entity and any product it sells.
 * - Any other entity type stays open (public page/category awareness).
 */
export interface IStatsAccessGuard {
  ensureProductReadable(
    productId: string,
    role: string | undefined,
    userId: string | undefined,
  ): Promise<void>;
  ensureEntityReadable(
    entityType: string,
    entityId: string,
    role: string | undefined,
    userId: string | undefined,
  ): Promise<void>;
}

export class StatsAccessGuard implements IStatsAccessGuard {
  constructor(private readonly access: IStatsAccessPort) {}

  async ensureProductReadable(
    productId: string,
    role: string | undefined,
    userId: string | undefined,
  ): Promise<void> {
    if (role === 'admin') return;

    const productVendorId = await this.access.getProductVendorId(productId);
    if (!productVendorId) throw new NotFoundError('Product not found.');

    await this.ensureVendorOwnership(productVendorId, userId, 'products');
  }

  async ensureEntityReadable(
    entityType: string,
    entityId: string,
    role: string | undefined,
    userId: string | undefined,
  ): Promise<void> {
    if (role === 'admin') return;
    if (entityType === 'product') return this.ensureProductReadable(entityId, role, userId);

    if (entityType === 'vendor') {
      await this.ensureVendorOwnership(entityId, userId, 'vendor');
    }
  }

  private async ensureVendorOwnership(
    vendorId: string,
    userId: string | undefined,
    subject: 'products' | 'vendor',
  ): Promise<void> {
    const ownedVendorId = userId ? await this.access.getVendorIdByOwnerId(userId) : null;
    if (!ownedVendorId || String(vendorId) !== String(ownedVendorId)) {
      throw new ForbiddenError(`You can only view stats for your own ${subject}.`);
    }
  }
}

let configuredAccess: IStatsAccessPort | null = null;

/** Wired once by the application composition root. */
export function configureStatsAccess(access: IStatsAccessPort): void {
  configuredAccess = access;
}

export function getStatsAccessGuard(): StatsAccessGuard {
  if (!configuredAccess) {
    throw new Error('Stats access port is not configured.');
  }
  return new StatsAccessGuard(configuredAccess);
}
