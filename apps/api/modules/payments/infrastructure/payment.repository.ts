import type {
  IPaymentRepository,
  PaymentAggregate,
  PaymentPage,
  PaymentPaginationFilter,
} from '@ecomerece/domain';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { Quantity } from '@ecomerece/domain/value-objects';
import type { FilterQuery } from 'mongoose';
import { MongoRepository } from '../../../core/repository/mongo.repository';
import { ConcurrencyError, NotFoundError } from '../../../errors/app-error';
import { PaymentMapper } from './payment.mapper';
import { PaymentModel, type PaymentPersistence } from './payment.model';

export class PaymentRepository
  extends MongoRepository<PaymentPersistence>
  implements IPaymentRepository
{
  constructor() {
    super(PaymentModel);
  }

  async FindById(id: Id): Promise<PaymentAggregate | null> {
    const doc = await super.findById(id.value);
    return doc ? PaymentMapper.persistenceToAggregate(doc) : null;
  }

  async FindByIdOrThrow(id: Id): Promise<PaymentAggregate> {
    const p = await this.FindById(id);
    if (!p) throw new NotFoundError('Payment not found.');
    return p;
  }

  async FindByOrderId(orderId: Id): Promise<PaymentAggregate[]> {
    const docs = await super.find({ orderId: orderId.value, 'deleted.deleted': false });
    return docs.map(PaymentMapper.persistenceToAggregate);
  }

  async FindByProviderRef(providerRef: string): Promise<PaymentAggregate | null> {
    const doc = await super.findOne({ providerRef, 'deleted.deleted': false });
    return doc ? PaymentMapper.persistenceToAggregate(doc) : null;
  }

  async Create(payment: PaymentAggregate): Promise<void> {
    await super.create(new PaymentModel(PaymentMapper.aggregateToPersistence(payment)));
  }

  async Save(payment: PaymentAggregate): Promise<void> {
    const { version: _version, ...data } = PaymentMapper.aggregateToPersistence(payment);
    const result = await super.updateOne(
      { _id: payment.id.value, version: payment.version.value },
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
    filter?: PaymentPaginationFilter;
    cursor?: Id;
    limit?: Quantity;
    direction?: 'next' | 'prev';
  }): Promise<PaymentPage> {
    const result = await this.paginateByCursor({
      filter: this.buildFilter(params.filter),
      cursor: params.cursor?.value,
      limit: params.limit?.value,
      direction: params.direction,
    });
    return {
      data: result.data.map((d: PaymentPersistence) => PaymentMapper.persistenceToAggregate(d)),
      meta: result.meta,
    };
  }

  private buildFilter(filter?: PaymentPaginationFilter): FilterQuery<PaymentPersistence> {
    const q: FilterQuery<PaymentPersistence> = { 'deleted.deleted': filter?.deleted ?? false };
    if (filter?.orderId) q.orderId = filter.orderId;
    if (filter?.buyerId) q.buyerId = filter.buyerId;
    if (filter?.status) q.status = filter.status;
    if (filter?.provider) q.provider = filter.provider;
    return q;
  }
}
