import type { IOrderItemsRepository, OrderItemsAggregate } from '@ecomerece/domain';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { UnitOfWork } from '../../../core/database/unit-of-work';
import { MongoRepository } from '../../../core/repository/mongo.repository';
import { BadRequestError, ConcurrencyError } from '../../../errors/app-error';
import { OrderItemsMapper } from './order-item.mapper';
import { OrderItemsModel, type OrderItemsPersistence } from './order-item.model';

export class OrderItemsRepository
  extends MongoRepository<OrderItemsPersistence>
  implements IOrderItemsRepository
{
  constructor(private readonly unitOfWork: UnitOfWork) {
    super(OrderItemsModel);
  }

  async FindById(id: Id): Promise<OrderItemsAggregate | null> {
    const doc = await super.findById(id.value);
    if (!doc) return null;
    return OrderItemsMapper.persistenceToAggregate(doc);
  }
  async FindByIdOrThrow(id: Id): Promise<OrderItemsAggregate> {
    const doc = await super.findById(id.value);
    if (!doc) throw new BadRequestError('Order item not found.');
    return OrderItemsMapper.persistenceToAggregate(doc);
  }

  async Save(item: OrderItemsAggregate): Promise<void> {
    const data = OrderItemsMapper.aggregateToPersistence(item);
    const result = await super.updateOne(
      {
        _id: item.id.value,
        version: item.version.value,
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

  async SaveMany(items: OrderItemsAggregate[]): Promise<void> {
    if (items.length === 0) return;
    const bulkOps = [];
    for (const item of items) {
      const data = OrderItemsMapper.aggregateToPersistence(item);
      bulkOps.push({
        updateOne: {
          filter: {
            _id: item.id.value,
            version: item.version.value,
          },
          update: {
            $set: data,
            $inc: { version: 1 },
          },
        },
      });
    }
    const result = await super.updateMany(bulkOps, { ordered: false });

    if (result.modifiedCount !== items.length)
      throw new ConcurrencyError('One or more items were concurrently modified.');
  }

  async Delete(id: Id): Promise<void> {
    await super.findByIdAndDelete(id.value);
  }

  async Create(item: OrderItemsAggregate): Promise<void> {
    const persistantProduct = OrderItemsMapper.aggregateToPersistence(item);
    const productDoc = new OrderItemsModel(persistantProduct);

    await super.create(productDoc);
  }

  async Exists(id: Id): Promise<boolean> {
    return !!(await super.exists({
      _id: id.value,
    }));
  }

  async createMany(items: OrderItemsAggregate[]): Promise<void> {
    if (!items || items.length === 0) return;

    const persistentItems = items.map(OrderItemsMapper.aggregateToPersistence);

    await super.bulkCreate(persistentItems, { ordered: false });
  }
}
