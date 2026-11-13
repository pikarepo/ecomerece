import type { EnsureActiveAddressResult, IAddressQueries } from '@ecomerece/contracts';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { AddressInternalService } from '../application/address.app.internal.service';

/** Contract-facing adapter for address reads. */
export class AddressQueryAdapter implements IAddressQueries {
  constructor(private readonly internalService: AddressInternalService) {}

  ensureActiveById(addressId: Id, userId: Id): Promise<EnsureActiveAddressResult> {
    return this.internalService.ensureActiveAddressGetById(addressId, userId);
  }
}
