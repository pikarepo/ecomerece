import type { IVendorRepository, VendorAggregate } from '@ecomerece/domain';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import type { Metrics } from '@ecomerece/shared';
import { type CollationOptions, MongoRepository } from '../../../core/repository/mongo.repository';
import { BadRequestError, ConcurrencyError, NotFoundError } from '../../../errors/app-error';
import { VendorMapper } from './vendor.mapper';

import { VendorModel, type VendorPersistence, type VendorPersistenceWithId } from './vendor.models';

export class VendorRepository
  extends MongoRepository<VendorPersistence>
  implements IVendorRepository
{
  constructor() {
    super(VendorModel);
  }

  async FindByOwnerId(id: Id): Promise<VendorAggregate | null> {
    const doc = await super.findOne({ ownerId: id });
    if (!doc) return null;
    return VendorMapper.persistenceToAggregate(doc);
  }
  async EnsureOwnershipOrThrow(vendorId: Id, userId: Id): Promise<VendorAggregate> {
    const doc = await super.findOne({ _id: vendorId, ownerId: userId });
    if (!doc) throw new BadRequestError('You do not own this vendor.');
    return VendorMapper.persistenceToAggregate(doc);
  }

  async FindById(id: Id): Promise<VendorAggregate | null> {
    const doc = await super.findById(id.value);
    if (!doc) return null;
    return VendorMapper.persistenceToAggregate(doc);
  }
  async FindByIds(id: Id[]): Promise<VendorAggregate[]> {
    const ids = id.map((value) => value.value);
    const filter = {
      _id: { $in: ids },
    };

    const docs = await super.find(filter);
    return docs.map((value) => VendorMapper.persistenceToAggregate(value));
  }

  async FindByIdOrThrow(id: Id): Promise<VendorAggregate> {
    const doc = await super.findById(id.value);

    if (!doc) {
      throw new NotFoundError('Vendor not found.');
    }

    return VendorMapper.persistenceToAggregate(doc);
  }
  async FindByOwnerIdOrThrow(id: Id): Promise<VendorAggregate> {
    const doc = await super.findOne({ ownerId: id });

    if (!doc) {
      throw new NotFoundError('Vendor not found.');
    }

    return VendorMapper.persistenceToAggregate(doc);
  }

  async Create(vendor: VendorAggregate): Promise<void> {
    const data = VendorMapper.aggregateToPersistence(vendor);

    await VendorModel.create({
      ...data,
    });
  }
  async Save(vendor: VendorAggregate): Promise<void> {
    const data = VendorMapper.aggregateToPersistence(vendor);

    const result = await VendorModel.updateOne(
      {
        _id: vendor.id.value,
        version: vendor.version,
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

  async Exists(id: Id): Promise<boolean> {
    return !!(await super.exists({
      _id: id.value,
    }));
  }

  async getStatsById(id: Id): Promise<Metrics | null> {
    const doc = await VendorModel.findById(id.value).select('stats').lean();
    return (doc?.stats as Metrics | undefined) ?? null;
  }

  async getStatsByIds(ids: Id[]): Promise<Map<string, Metrics>> {
    const rawIds = ids.map((id) => id.value);
    if (rawIds.length === 0) return new Map();

    const docs = await VendorModel.find({ _id: { $in: rawIds } })
      .select('_id stats')
      .lean();

    return new Map(docs.map((doc) => [String(doc._id), (doc.stats ?? {}) as Metrics]));
  }

  async FindPaginated(params: {
    filter?: Record<string, unknown>;
    cursor?: Id;
    limit?: Quantity;
    direction?: 'next' | 'prev';
    collation?: CollationOptions;
  }): Promise<{
    data: VendorAggregate[];
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
      collation: params.collation,
    });

    return {
      data: result.data.map((doc: VendorPersistenceWithId) =>
        VendorMapper.persistenceToAggregate(doc),
      ),
      meta: result.meta,
    };
  }
}
