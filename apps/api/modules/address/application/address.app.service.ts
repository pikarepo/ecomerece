import type { IEventBus } from '@ecomerece/domain/events/event-bus.interface';
import { AddressAggregate } from '@ecomerece/domain/modules/address/address.aggregate';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import { Reason } from '@ecomerece/domain/value-objects/reason.vo';
import {
  AddressVO,
  CityVO,
  CountryVO,
  PostalCodeVO,
  StateVO,
  StreetAddressVO,
} from '@ecomerece/domain/value-objects/street-address.vo';
import type { FilterQuery } from 'mongoose';
import type {
  AddressResponseReadModel,
  createMyAddressDtoType,
  GetAdminPaginatedAddressesQueryDto,
} from '../../../../../packages/shared';
import type { updateMyAddressDtoType } from '../../../../../packages/shared/request-dtos/address/update-address.dto';
import type { InMemoryQueryBus } from '../../../core/infrastructure/buses/in-memory-query-bus';
import { BaseService } from '../../../core/services/base.services';
import { BadRequestError } from '../../../errors/app-error';
import { EnsureActiveUserGetByIdQuery } from '../../user/application/queries/ensure-active-user-get-by-id.query';
import type { UserPersistence } from '../../user/infrastructure/user.models';
import { AddressMapper } from '../infrastructure/address.mapper';
import type { AddressPersistence } from '../infrastructure/address.models';
import type { AddressRepository } from '../infrastructure/address.repository';
import { AddressMessages, type addressMessagesType } from '../presentation/address.messages';

export class AddressApplicationService extends BaseService {
  constructor(
    private readonly addressRepo: AddressRepository,
    private readonly queryBus: InMemoryQueryBus,
    private readonly eventBus: IEventBus,
  ) {
    super();
  }

  private async publishEvents(address: AddressAggregate): Promise<void> {
    const events = address.pullEvents();
    if (events.length > 0) {
      await this.eventBus.publish(events);
    }
  }

  async canEditAddress(actorId: Id): Promise<void> {
    const activeUser = await this.queryBus.execute(
      new EnsureActiveUserGetByIdQuery({ userId: actorId }),
    );
    if (!activeUser.user) throw new BadRequestError('User not found.');
    if (!activeUser.active) throw new BadRequestError('User is not active.');
  }

  async getMyAddresses(actor: UserPersistence): Promise<AddressResponseReadModel[] | null> {
    const userId = Id.create(actor._id);
    const address = await this.addressRepo.FindByOwnerId(userId);
    if (!address) return null;
    const addresses = address.map((value) => AddressMapper.aggregateToResponseReadModel(value));
    return addresses;
  }

  async recoverAddress(id: string, actor: UserPersistence): Promise<addressMessagesType> {
    const addressId = Id.create(id);
    const actorId = Id.create(actor._id);
    const address = await this.addressRepo.FindByIdOrThrow(addressId);
    address.recoverAddress(actorId);
    await this.addressRepo.Save(address);
    await this.publishEvents(address);
    const response = AddressMapper.aggregateToResponseReadModel(address);
    return AddressMessages.addressRecovered(actorId, addressId, response);
  }

  async setMyAddressAsDefault(id: string, actor: UserPersistence) {
    const addressId = Id.create(id);
    const actorId = Id.create(actor._id);
    const address = await this.addressRepo.FindByIdOrThrow(addressId);
    address.setAsDefault();
    await this.addressRepo.Save(address);
    await this.publishEvents(address);
    const response = AddressMapper.aggregateToResponseReadModel(address);
    return AddressMessages.defaultAddress(actorId, addressId, response);
  }

  async deleteMyAddress(id: string, actor: UserPersistence): Promise<addressMessagesType> {
    const addressId = Id.create(id);
    const actorId = Id.create(actor._id);
    const address = await this.addressRepo.FindByIdOrThrow(addressId);
    const reason = Reason.create('Address deletion not hold reason');
    address.deleteAddress(reason, actorId);
    await this.addressRepo.Save(address);
    await this.publishEvents(address);
    return AddressMessages.addressDeleted(actorId, addressId);
  }

  async createMyAddress(
    data: createMyAddressDtoType,
    actor: UserPersistence,
  ): Promise<addressMessagesType> {
    const addressId = Id.create();
    const actorId = Id.create(actor._id);
    const streetAddress = StreetAddressVO.create(data.streetAddress);
    const city = CityVO.create(data.city);
    const state = StateVO.create(data.state);
    const postalCode = PostalCodeVO.create(data.postalCode);
    const country = CountryVO.create(data.country);
    const address = AddressAggregate.create({
      _id: addressId,
      _city: city,
      _country: country,
      _ownerId: actorId,
      _postalCode: postalCode,
      _state: state,
      _streetAddress: streetAddress,
    });
    const exsistingAddress = await this.addressRepo.FindByOwnerId(actorId);
    if (exsistingAddress && exsistingAddress?.length >= 4)
      throw new BadRequestError('A maximum of four addresses is allowed per user.');
    await this.canEditAddress(actorId);
    await this.addressRepo.Create(address);
    await this.publishEvents(address);
    const response = AddressMapper.aggregateToResponseReadModel(address);
    return AddressMessages.addressCreated(actorId, addressId, response);
  }

  async updateMyAddress(id: string, actor: UserPersistence, data: updateMyAddressDtoType) {
    const addressId = Id.create(id);
    const actorId = Id.create(actor._id);
    const address = await this.addressRepo.FindByIdOrThrow(addressId);
    const streetAddress = StreetAddressVO.create(data.streetAddress);
    const city = CityVO.create(data.city);
    const state = StateVO.create(data.state);
    const postalCode = PostalCodeVO.create(data.postalCode);
    const country = CountryVO.create(data.country);
    const updated = AddressVO.create(streetAddress, city, state, postalCode, country);
    await this.canEditAddress(actorId);
    address.updateAddress(updated, actorId);
    await this.addressRepo.Save(address);
    await this.publishEvents(address);
    const response = AddressMapper.aggregateToResponseReadModel(address);
    return AddressMessages.addressUpdated(actorId, addressId, response);
  }

  // Admin: all addresses — no baseline restrictions, optional filters
  async findAdminPaginatedAddresses(query: GetAdminPaginatedAddressesQueryDto) {
    const filter: FilterQuery<AddressPersistence> = {};
    if (query.ownerId) filter.ownerId = Id.create(query.ownerId).value;
    if (query.deleted !== undefined) filter['deleted.deleted'] = query.deleted;
    const cursor = query.cursor ? Id.create(query.cursor) : undefined;
    const limit = query.limit ? Quantity.create(query.limit) : undefined;
    const result = await this.addressRepo.FindPaginated({
      filter,
      cursor,
      limit,
      direction: query.direction,
    });
    return {
      data: result.data.map((address) => AddressMapper.aggregateToReadModel(address)),
      meta: result.meta,
    };
  }
}
