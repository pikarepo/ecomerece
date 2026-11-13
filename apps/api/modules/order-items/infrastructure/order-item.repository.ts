import type { OrderItemReadModel, IOrderItemsRepository, OrderItemsAggregate, Quantity } from '@ecomerece/domain';
import { StatusEnum } from '@ecomerece/domain';
import type { OrderItemFailureInput } from '@ecomerece/contracts';
import type { OrderItemResponseReadModel } from '@ecomerece/shared';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { FilterQuery } from 'mongoose';
import { MongoRepository } from '../../../core/repository/mongo.repository';
import { BadRequestError, ConcurrencyError } from '../../../errors/app-error';
import { OrderItemsMapper } from './order-item.mapper';
import { OrderItemsModel, type OrderItemsPersistence } from './order-item.model';

/**
 * `failureReason: null` filters rejected cart lines out of aggregate loads:
 * they are persisted records with no product/vendor/price, so they can never
 * be rehydrated into an `OrderItemsAggregate` or drive a state transition.
 */
const VALID_LINE = { failureReason: null } as const;

export class OrderItemsRepository
  extends MongoRepository<OrderItemsPersistence>
  implements IOrderItemsRepository {
  constructor() {
    super(OrderItemsModel);
  }

  async FindByIds(ids: Id[]): Promise<OrderItemsAggregate[]> {
    const idValues = ids.map((id) => id.value);
    const docs = await super.find({ _id: { $in: idValues }, ...VALID_LINE });
    return docs.map(OrderItemsMapper.persistenceToAggregate);
  }
  async FindByOrderId(orderId: Id): Promise<OrderItemsAggregate[]> {
    const docs = await super.find({ orderId: orderId.value, ...VALID_LINE });
    return docs.map(OrderItemsMapper.persistenceToAggregate);
  }

  async FindById(id: Id): Promise<OrderItemsAggregate | null> {
    const doc = await super.findById(id.value);
    if (!doc || doc.failureReason) return null;
    return OrderItemsMapper.persistenceToAggregate(doc);
  }
  async FindByIdOrThrow(id: Id): Promise<OrderItemsAggregate> {
    const doc = await super.findById(id.value);
    if (!doc || doc.failureReason) throw new BadRequestError('Order item not found.');
    return OrderItemsMapper.persistenceToAggregate(doc);
  }

  /** Read model for one order item, rejected lines included. */
  async FindReadModelById(id: Id): Promise<OrderItemReadModel | null> {
    const doc = await super.findById(id.value);
    if (!doc) return null;
    return OrderItemsMapper.persistenceToReadModel(doc);
  }

  /** Read models for an order, rejected lines included. */
  async FindReadModelsByOrderId(orderId: Id): Promise<OrderItemReadModel[]> {
    const docs = await super.find({ orderId: orderId.value });
    return docs.map(OrderItemsMapper.persistenceToReadModel);
  }

  /** API read model for one order item, rejected lines included. */
  async FindResponseById(id: Id): Promise<OrderItemResponseReadModel | null> {
    const doc = await super.findById(id.value);
    if (!doc) return null;
    return OrderItemsMapper.persistenceToResponseReadModel(doc);
  }

  /** API read models for an order, rejected lines included. */
  async FindResponseByOrderId(orderId: Id): Promise<OrderItemResponseReadModel[]> {
    const docs = await super.find({ orderId: orderId.value });
    return docs.map(OrderItemsMapper.persistenceToResponseReadModel);
  }

  /** Failed lines only: they can never be rehydrated as aggregates. */
  async FindFailedByIds(ids: Id[]): Promise<OrderItemsPersistence[]> {
    return super.find({
      _id: { $in: ids.map((id) => id.value) },
      failureReason: { $ne: null },
    });
  }

  /** One rejected line, or null when the id is not a failed line. */
  async FindFailedReadModelById(id: Id): Promise<OrderItemReadModel | null> {
    const doc = await super.findById(id.value);
    if (!doc || !doc.failureReason) return null;
    return OrderItemsMapper.persistenceToReadModel(doc);
  }

  /** Rejected lines of one order, used to retry their fulfilment. */
  async FindFailedReadModelsByOrderId(orderId: Id): Promise<OrderItemReadModel[]> {
    const docs = await super.find({
      orderId: orderId.value,
      failureReason: { $ne: null },
    });
    return docs.map(OrderItemsMapper.persistenceToReadModel);
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

  /**
   * Persists rejected cart lines: no product, vendor, price or reservation, so
   * the buyer is never charged for them and stock is never held.
   */
  async createFailures(items: OrderItemFailureInput[]): Promise<void> {
    if (items.length === 0) return;

    const now = new Date();
    const docs: OrderItemsPersistence[] = items.map((item) => ({
      _id: item.id.value,
      quantity: item.quantity.value,
      waitingTime: item.waitingTime.value,
      status: StatusEnum.FAILED,
      totalPrice: 0,
      price: null,
      orderId: item.orderId.value,
      vendorId: null,
      productId: null,
      variantId: item.variantId.value,
      failureReason: item.reason,
      version: 0,
      deleted: { deleted: false, deletedFrom: null, deletedBy: null, reason: null },
      createdAt: now,
      updatedAt: now,
    }));

    await super.bulkCreate(docs, { ordered: false });
  }

  /** Admin listing: rejected lines are included, so they stay visible. */
  async FindPaginated(params: {
    filter?: FilterQuery<OrderItemsPersistence>;
    cursor?: Id;
    limit?: Quantity;
    direction?: 'next' | 'prev';
  }): Promise<{
    data: OrderItemReadModel[];
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

    return {
      data: result.data.map((doc: OrderItemsPersistence) =>
        OrderItemsMapper.persistenceToReadModel(doc),
      ),
      meta: result.meta,
    };
  }
}
