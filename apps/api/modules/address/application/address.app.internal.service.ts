import type { AddressReadModel } from '@ecomerece/domain/modules/address/read-models/address.read-models';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import { BaseService } from '../../../core/services/base.services';
import { AddressMapper } from '../infrastructure/address.mapper';
import type { AddressRepository } from '../infrastructure/address.repository';

export class AddressInternalService extends BaseService {
  constructor(private readonly addressRepo: AddressRepository) {
    super();
  }

  async getAddressById(addressId: Id): Promise<AddressReadModel | null> {
    const address = await this.addressRepo.FindById(addressId);
    if (!address) return null;
    return AddressMapper.aggregateToReadModel(address);
  }

  async getAddressesByOwnerId(ownerId: Id): Promise<AddressReadModel[]> {
    const addresses = await this.addressRepo.FindByOwnerId(ownerId);
    return (addresses ?? []).map((address) => AddressMapper.aggregateToReadModel(address));
  }

  async ensureActiveAddressGetById(
    addressId: Id,
    userId: Id,
  ): Promise<{ address: AddressReadModel | null; active: boolean }> {
    const address = await this.addressRepo.FindById(addressId);
    if (!address) return { address: null, active: false };

    if (address.ownerId.value !== userId.value) return { address: null, active: false };

    const AddressReadModel = AddressMapper.aggregateToReadModel(address);

    if (address.delete.isDeleted) return { address: AddressReadModel, active: false };

    return { address: AddressReadModel, active: true };
  }
}
