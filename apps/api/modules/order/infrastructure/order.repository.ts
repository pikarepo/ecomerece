import type { IOrderRepository, OrderAggregate, Quantity } from '@ecomerece/domain';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { FilterQuery } from 'mongoose';
import { MongoRepository } from '../../../core/repository/mongo.repository';
import { BadRequestError, ConcurrencyError } from '../../../errors/app-error';
import { OrderMapper } from './order.mapper';
import { OrderModel, type OrderPersistence } from './order.model';

export class OrderRepository extends MongoRepository<OrderPersistence> implements IOrderRepository {
  constructor() {
    super(OrderModel);
  }

  async FindById(id: Id): Promise<OrderAggregate | null> {
    const doc = await super.findById(id.value);
    if (!doc) return null;
    return OrderMapper.persistenceToAggregate(doc);
  }

  async EnsureUniqueImpodentKey(key: Id): Promise<void> {
    const doc = await super.findOne({ idempotentKey: key.value });
    if (doc) {
      throw new BadRequestError('This order was already created with the same idempotency key.');
    }
  }

  async FindByIdOrThrow(id: Id): Promise<OrderAggregate> {
    const doc = await super.findById(id.value);
    if (!doc) throw new BadRequestError('Order not found.');
    return OrderMapper.persistenceToAggregate(doc);
  }

  async Save(product: OrderAggregate): Promise<void> {
    const data = OrderMapper.aggregateToPersistence(product);

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

    if (result.modifiedCount === 0) throw new ConcurrencyError();
  }
  async Delete(id: Id): Promise<void> {
    await super.findByIdAndDelete(id.value);
  }

  async Create(product: OrderAggregate): Promise<void> {
    const persistantProduct = OrderMapper.aggregateToPersistence(product);
    const productDoc = new OrderModel(persistantProduct);
    await super.create(productDoc);
  }

  async Exists(id: Id): Promise<boolean> {
    return !!(await super.exists({
      _id: id.value,
    }));
  }

  async FindPaginated(params: {
    filter?: FilterQuery<OrderPersistence>;
    cursor?: Id;
    limit?: Quantity;
    direction?: 'next' | 'prev';
  }): Promise<{
    data: OrderAggregate[];
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

    const data = result.data.map((doc: OrderPersistence) =>
      OrderMapper.persistenceToAggregate(doc),
    );

    return {
      data,
      meta: result.meta,
    };
  }
}
