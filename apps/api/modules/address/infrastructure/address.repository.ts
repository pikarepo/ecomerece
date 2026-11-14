import type { AddressAggregate } from '@ecomerece/domain/modules/address/address.aggregate';
import type { IAddressRepository } from '@ecomerece/domain/modules/address/ports/i-address-repository';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import type { FilterQuery } from 'mongoose';
import { MongoRepository } from '../../../core/repository/mongo.repository';
import { BadRequestError, ConcurrencyError } from '../../../errors/app-error';
import { AddressMapper } from './address.mapper';
import { AddressModel, type AddressPersistence } from './address.models';

export class AddressRepository
  extends MongoRepository<AddressPersistence>
  implements IAddressRepository
{
  constructor() {
    super(AddressModel);
  }

  async FindById(id: Id): Promise<AddressAggregate | null> {
    const doc = await super.findById(id.value);
    if (!doc) return null;
    return AddressMapper.persistenceToAggregate(doc);
  }

  async FindByIdOrThrow(id: Id): Promise<AddressAggregate> {
    const doc = await super.findById(id.value);
    if (!doc) throw new BadRequestError('Address not found.');
    return AddressMapper.persistenceToAggregate(doc);
  }

  async FindByOwnerId(id: Id): Promise<AddressAggregate[] | null> {
    const docs = await super.find({
      ownerId: id.value,
      'deleted.deleted': false,
    });
    if (!docs || docs.length === 0) return null;
    return docs.map((doc) => AddressMapper.persistenceToAggregate(doc));
  }

  async Save(product: AddressAggregate): Promise<void> {
    const data = AddressMapper.aggregateToPersistence(product);
    const result = await super.updateOne(
      {
        _id: product.id.value,
        version: product.version.value,
      },
      {
        $set: data,
        $inc: { version: 1 },
      },
    );

    if (result.modifiedCount === 0) {
      throw new ConcurrencyError();
    }
  }

  async Delete(id: Id): Promise<void> {
    await super.findByIdAndDelete(id.value);
  }

  async Create(add: AddressAggregate): Promise<void> {
    const persistantProduct = AddressMapper.aggregateToPersistence(add);
    const productDoc = new AddressModel(persistantProduct);

    await super.create(productDoc);
  }

  async Exists(id: Id): Promise<boolean> {
    return !!(await super.exists({
      _id: id.value,
    }));
  }

  async FindPaginated(params: {
    filter?: FilterQuery<AddressPersistence>;
    cursor?: Id;
    limit?: Quantity;
    direction?: 'next' | 'prev';
  }): Promise<{
    data: AddressAggregate[];
    meta: {
      nextCursor: string | null;
      prevCursor: string | null;
      hasMore: boolean;
    };
  }> {
    const result = await this.paginateByCursor({
      filter: params.filter,
      cursor: params.cursor?.value,
      limit: params.limit?.value,
      direction: params.direction,
    });

    const data = result.data.map((doc: AddressPersistence) =>
      AddressMapper.persistenceToAggregate(doc),
    );

    return {
      data,
      meta: result.meta,
    };
  }
}
