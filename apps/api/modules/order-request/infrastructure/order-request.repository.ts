import type { OrderRequestAggregate } from '@ecomerece/domain/modules/order-request/order-request.aggregate';
import type { IOrderRequestRepository } from '@ecomerece/domain/modules/order-request/ports/i-order-request.repository';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import type { FilterQuery } from 'mongoose';
import { MongoRepository } from '../../../core/repository/mongo.repository';
import { BadRequestError } from '../../../errors/app-error';
import { OrderRequestMapper } from './order-request.mapper';
import { OrderRequestModel, type OrderRequestPersistence } from './order-request.model';

export class OrderRequestRepository
  extends MongoRepository<OrderRequestPersistence>
  implements IOrderRequestRepository
{
  constructor() {
    super(OrderRequestModel);
  }

  async FindById(id: Id): Promise<OrderRequestAggregate | null> {
    const doc = await super.findById(id.value);
    if (!doc) return null;
    return OrderRequestMapper.persistenceToAggregate(doc);
  }

  async FindByIdOrThrow(id: Id): Promise<OrderRequestAggregate> {
    const doc = await super.findById(id.value);
    if (!doc) throw new BadRequestError('Order request not found.');
    return OrderRequestMapper.persistenceToAggregate(doc);
  }

  async FindByBuyerId(buyerId: Id): Promise<OrderRequestAggregate[]> {
    const docs = await super.find({ buyerId: buyerId.value });
    return docs.map((doc) => OrderRequestMapper.persistenceToAggregate(doc));
  }

  async FindByVendorId(vendorId: Id): Promise<OrderRequestAggregate[]> {
    const docs = await super.find({ vendorId: vendorId.value });
    return docs.map((doc) => OrderRequestMapper.persistenceToAggregate(doc));
  }

  async FindByOrderId(orderId: Id): Promise<OrderRequestAggregate[]> {
    const docs = await super.find({ orderId: orderId.value });
    return docs.map((doc) => OrderRequestMapper.persistenceToAggregate(doc));
  }

  async Create(request: OrderRequestAggregate): Promise<void> {
    const persistence = OrderRequestMapper.aggregateToPersistence(request);
    await super.create(persistence);
  }

  async Save(request: OrderRequestAggregate): Promise<void> {
    const { _id: _, createdAt: __, ...data } = OrderRequestMapper.aggregateToPersistence(request);
    const result = await super.updateOne({ _id: request.id.value }, { $set: data });
    if (result.matchedCount === 0) {
      throw new BadRequestError('Order request not found.');
    }
  }

  async FindPaginated(params: {
    filter?: FilterQuery<OrderRequestPersistence>;
    cursor?: Id;
    limit?: Quantity;
    direction?: 'next' | 'prev';
  }): Promise<{
    data: OrderRequestAggregate[];
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
      data: result.data.map((doc: OrderRequestPersistence) =>
        OrderRequestMapper.persistenceToAggregate(doc),
      ),
      meta: result.meta,
    };
  }
}
