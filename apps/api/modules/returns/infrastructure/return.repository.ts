import type {
  IReturnRepository,
  ReturnPage,
  ReturnPaginationFilter,
  ReturnRequestAggregate,
} from '@ecomerece/domain';
import type { Id, Quantity } from '@ecomerece/domain/value-objects';
import type { FilterQuery } from 'mongoose';
import { MongoRepository } from '../../../core/repository/mongo.repository';
import { ConcurrencyError, NotFoundError } from '../../../errors/app-error';
import { ReturnMapper } from './return.mapper';
import { ReturnModel, type ReturnPersistence } from './return.model';

export class ReturnRepository
  extends MongoRepository<ReturnPersistence>
  implements IReturnRepository
{
  constructor() {
    super(ReturnModel);
  }

  async FindById(id: Id): Promise<ReturnRequestAggregate | null> {
    const doc = await super.findById(id.value);
    if (!doc) return null;
    return ReturnMapper.persistenceToAggregate(doc);
  }

  async FindByIdOrThrow(id: Id): Promise<ReturnRequestAggregate> {
    const request = await this.FindById(id);
    if (!request) throw new NotFoundError('Return request not found.');
    return request;
  }

  async FindByOrderId(orderId: Id): Promise<ReturnRequestAggregate[]> {
    const docs = await super.find({ orderId: orderId.value, 'deleted.deleted': false });
    return docs.map(ReturnMapper.persistenceToAggregate);
  }

  async FindByOrderItemId(orderItemId: Id): Promise<ReturnRequestAggregate[]> {
    const docs = await super.find({ orderItemId: orderItemId.value, 'deleted.deleted': false });
    return docs.map(ReturnMapper.persistenceToAggregate);
  }

  async Create(request: ReturnRequestAggregate): Promise<void> {
    await super.create(new ReturnModel(ReturnMapper.aggregateToPersistence(request)));
  }

  async Save(request: ReturnRequestAggregate): Promise<void> {
    const { version: _version, ...data } = ReturnMapper.aggregateToPersistence(request);

    const result = await super.updateOne(
      { _id: request.id.value, version: request.version.value },
      { $set: data, $inc: { version: 1 } },
    );

    if (result.modifiedCount === 0) throw new ConcurrencyError();
  }

  async Delete(id: Id): Promise<void> {
    await super.findByIdAndDelete(id.value);
  }

  async Exists(id: Id): Promise<boolean> {
    return !!(await super.exists({ _id: id.value }));
  }

  async FindPaginated(params: {
    filter?: ReturnPaginationFilter;
    cursor?: Id;
    limit?: Quantity;
    direction?: 'next' | 'prev';
  }): Promise<ReturnPage> {
    const result = await this.paginateByCursor({
      filter: this.buildFilter(params.filter),
      cursor: params.cursor?.value,
      limit: params.limit?.value,
      direction: params.direction,
    });

    return {
      data: result.data.map((doc: ReturnPersistence) => ReturnMapper.persistenceToAggregate(doc)),
      meta: result.meta,
    };
  }

  private buildFilter(filter?: ReturnPaginationFilter): FilterQuery<ReturnPersistence> {
    const query: FilterQuery<ReturnPersistence> = {
      'deleted.deleted': filter?.deleted ?? false,
    };

    if (filter?.orderId) query.orderId = filter.orderId;
    if (filter?.orderItemId) query.orderItemId = filter.orderItemId;
    if (filter?.vendorId) query.vendorId = filter.vendorId;
    if (filter?.buyerId) query.buyerId = filter.buyerId;
    if (filter?.status) query.status = filter.status;

    return query;
  }
}
