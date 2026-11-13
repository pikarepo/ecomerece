import type { AddressReadModel } from '@ecomerece/domain/modules/address/read-models/address.read-models';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';

/** Result of checking an address exists, is active, and belongs to a user. */
export interface EnsureActiveAddressResult {
  address: AddressReadModel | null;
  active: boolean;
}

/** Cross-module read port implemented by the address module. */
export interface IAddressQueries {
  ensureActiveById(addressId: Id, userId: Id): Promise<EnsureActiveAddressResult>;
}
