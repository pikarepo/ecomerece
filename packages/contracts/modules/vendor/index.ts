import type { VendorReadModel } from '@ecomerece/domain';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';

/** Result of checking a vendor exists and may be used. */
export interface EnsureActiveVendorResult {
  vendor: VendorReadModel | null;
  active: boolean;
}

/** Cross-module read port implemented by the vendor module. */
export interface IVendorQueries {
  ensureActiveById(vendorId: Id): Promise<EnsureActiveVendorResult>;
  /** Resolves the vendor owned by a user and reports whether it may act. */
  ensureActiveByUserId(userId: Id): Promise<EnsureActiveVendorResult>;
  getByUserId(userId: Id): Promise<VendorReadModel | null>;
}

export interface IVendorStatsProjector {
  listVendorIds(): Promise<string[]>;
  setVendorStats(vendorId: string, metrics: Record<string, number>): Promise<void>;
  applyStats(updates: { vendorId: string; metrics: Record<string, number> }[]): Promise<void>;
}
