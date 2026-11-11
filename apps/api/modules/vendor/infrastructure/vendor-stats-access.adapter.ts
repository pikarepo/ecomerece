import type { IStatsAccessPort } from '@ecomerece/contracts';
import { Id } from '@ecomerece/domain';
import type { VendorRepository } from './vendor.repository';

/** Vendor-side implementation of the stats access port. */
export class VendorStatsAccessAdapter implements Pick<IStatsAccessPort, 'getVendorIdByOwnerId'> {
  constructor(private readonly repo: VendorRepository) {}

  async getVendorIdByOwnerId(ownerId: string): Promise<string | null> {
    try {
      const vendor = await this.repo.FindByOwnerId(Id.create(ownerId));
      return vendor?.id.value ?? null;
    } catch {
      return null;
    }
  }
}
