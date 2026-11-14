import type { IIventoryRepository, InventoryAggregate, Quantity } from '@ecomerece/domain';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { FilterQuery } from 'mongoose';
import { MongoRepository } from '../../../core/repository/mongo.repository';
import { BadRequestError, ConcurrencyError } from '../../../errors/app-error';
import { InventoryMapper } from './inventory.mapper';
import { InventoryModel, type InventoryPersistence } from './inventory.model';

export class InventoryReposityory
  extends MongoRepository<InventoryPersistence>
  implements IIventoryRepository
{
  constructor() {
    super(InventoryModel);
  }

  async FindById(id: Id): Promise<InventoryAggregate | null> {
    const doc = await super.findById(id.value);
    if (!doc) return null;
    return InventoryMapper.persistenceToAggregate(doc);
  }
  async FindByVariantIds(ids: Id[]): Promise<InventoryAggregate[]> {
    const variantIdValues = ids.map((id) => id.value);
    const docs = await super.find({ variantId: { $in: variantIdValues } });
    return docs.map((doc) => InventoryMapper.persistenceToAggregate(doc));
  }

  async FindByVariantId(id: Id): Promise<InventoryAggregate | null> {
    const doc = await super.findOne({ variantId: id.value });
    if (!doc) return null;
    return InventoryMapper.persistenceToAggregate(doc);
  }

  async FindByIdOrThrow(id: Id): Promise<InventoryAggregate> {
    const doc = await super.findById(id.value);
    if (!doc) throw new BadRequestError('Inventory not found.');
    return InventoryMapper.persistenceToAggregate(doc);
  }

  async FindByVariantIdOrThrow(id: Id): Promise<InventoryAggregate> {
    const doc = await super.findOne({ variantId: id.value });
    if (!doc) throw new BadRequestError('No inventory exists for this variant.');
    return InventoryMapper.persistenceToAggregate(doc);
  }

  async Save(inventory: InventoryAggregate): Promise<void> {
    const data = InventoryMapper.aggregateToPersistence(inventory);
    const result = await super.updateOne(
      {
        _id: inventory.id.value,
        version: inventory.version.value,
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

  async SaveMany(inventories: InventoryAggregate[]): Promise<void> {
    if (inventories.length === 0) return;
    const bulkOps = [];
    for (const inventory of inventories) {
      const data = InventoryMapper.aggregateToPersistence(inventory);
      bulkOps.push({
        updateOne: {
          filter: {
            _id: inventory.id.value,
            version: inventory.version.value,
          },
          update: {
            $set: data,
            $inc: { version: 1 },
          },
        },
      });
    }

    const result = await this.bulkWrite(bulkOps, { ordered: false });

    if (result.modifiedCount !== inventories.length) {
      throw new ConcurrencyError('One or more inventories were concurrently modified.');
    }
  }

  async Delete(id: Id): Promise<void> {
    const doc = await super.findByIdAndDelete(id.value);
    if (!doc) throw new BadRequestError('Inventory not found.');
  }

  async Exists(id: Id): Promise<boolean> {
    return !!(await super.exists({
      _id: id.value,
    }));
  }

  async Create(inventory: InventoryAggregate): Promise<void> {
    const inventoryPersistence = InventoryMapper.aggregateToPersistence(inventory);
    const inventoryDoc = new InventoryModel(inventoryPersistence);
    await super.create(inventoryDoc);
  }

  async FindPaginated(params: {
    filter?: FilterQuery<InventoryPersistence>;
    cursor?: Id;
    limit?: Quantity;
    direction?: 'next' | 'prev';
  }): Promise<{
    data: InventoryAggregate[];
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

    const data = result.data.map((doc: InventoryPersistence) =>
      InventoryMapper.persistenceToAggregate(doc),
    );

    return {
      data,
      meta: result.meta,
    };
  }
}
