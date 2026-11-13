import type { EnsureActiveVendorResult, IVendorQueries } from '@ecomerece/contracts';
import type { VendorReadModel } from '@ecomerece/domain';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { VendorInternalService } from '../application/vendor.internal.service';

/** Contract-facing adapter for vendor reads. */
export class VendorQueryAdapter implements IVendorQueries {
  constructor(private readonly internalService: VendorInternalService) {}

  ensureActiveById(vendorId: Id): Promise<EnsureActiveVendorResult> {
    return this.internalService.ensureActiveVendorGetById(vendorId);
  }

  getByUserId(userId: Id): Promise<VendorReadModel | null> {
    return this.internalService.getVendorByUserId(userId);
  }
}
