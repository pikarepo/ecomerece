import type { Id } from '@ecomerece/domain/value-objects/id.vo';

/**
 * Cross-module read port for owner/admin stats checks. Implemented by the
 * product and vendor modules and composed in the application composition root.
 */
export interface IStatsAccessPort {
  getProductVendorId(productId: string): Promise<string | null>;
  getVendorIdByOwnerId(ownerId: string): Promise<string | null>;
}

/** Minimal existence port used by the stats view guard. */
export interface IEntityExistsPort {
  Exists(id: Id): Promise<boolean>;
}
