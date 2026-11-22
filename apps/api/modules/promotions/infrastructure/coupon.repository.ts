import {
  type CouponAggregate,
  type CouponPage,
  type CouponPaginationFilter,
  type CouponRedemptionInput,
  type ICouponRepository,
} from '@ecomerece/domain';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { Quantity } from '@ecomerece/domain/value-objects';
import type { FilterQuery } from 'mongoose';
import { MongoRepository } from '../../../core/repository/mongo.repository';
import { ConcurrencyError, NotFoundError } from '../../../errors/app-error';
import { CouponMapper } from './coupon.mapper';
import {
  CouponModel,
  CouponRedemptionModel,
  type CouponPersistence,
  type CouponRedemptionPersistence,
} from './coupon.model';

export class CouponRepository
  extends MongoRepository<CouponPersistence>
  implements ICouponRepository
{
  constructor() {
    super(CouponModel);
  }

  async FindById(id: Id): Promise<CouponAggregate | null> {
    const doc = await super.findById(id.value);
    if (!doc) return null;
    return CouponMapper.persistenceToAggregate(doc);
  }

  async FindByCode(code: string): Promise<CouponAggregate | null> {
    const doc = await super.findOne({
      code: code.trim().toUpperCase(),
      'deleted.deleted': false,
    });
    if (!doc) return null;
    return CouponMapper.persistenceToAggregate(doc);
  }

  async Create(coupon: CouponAggregate): Promise<void> {
    await super.create(new CouponModel(CouponMapper.aggregateToPersistence(coupon)));
  }

  async Save(coupon: CouponAggregate): Promise<void> {
    const { version: _version, ...data } = CouponMapper.aggregateToPersistence(coupon);

    const result = await super.updateOne(
      { _id: coupon.id.value, version: coupon.version.value },
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

  async CountRedemptionsByBuyer(couponId: Id, buyerId: Id): Promise<number> {
    return CouponRedemptionModel.countDocuments({
      couponId: couponId.value,
      buyerId: buyerId.value,
    });
  }

  async HasRedeemed(couponId: Id, orderId: Id): Promise<boolean> {
    const existing = await CouponRedemptionModel.exists({
      couponId: couponId.value,
      orderId: orderId.value,
    });

    return !!existing;
  }

  async CreateRedemption(redemption: CouponRedemptionInput): Promise<void> {
    await CouponRedemptionModel.create({
      // Redemption rows are their own aggregate-level record; the order id is not the key.
      _id: Id.create().value,
      couponId: redemption.couponId.value,
      orderId: redemption.orderId.value,
      buyerId: redemption.buyerId.value,
      discountAmount: redemption.discountAmount,
      redeemedAt: new Date(),
    } satisfies Partial<CouponRedemptionPersistence>);
  }

  async FindPaginated(params: {
    filter?: CouponPaginationFilter;
    cursor?: Id;
    limit?: Quantity;
    direction?: 'next' | 'prev';
  }): Promise<CouponPage> {
    const result = await this.paginateByCursor({
      filter: this.buildFilter(params.filter),
      cursor: params.cursor?.value,
      limit: params.limit?.value,
      direction: params.direction,
    });

    return {
      data: result.data.map((doc: CouponPersistence) => CouponMapper.persistenceToAggregate(doc)),
      meta: result.meta,
    };
  }

  private buildFilter(filter?: CouponPaginationFilter): FilterQuery<CouponPersistence> {
    const query: FilterQuery<CouponPersistence> = {
      'deleted.deleted': filter?.deleted ?? false,
    };

    if (filter?.code) query.code = filter.code.trim().toUpperCase();
    if (filter?.active !== undefined) query.active = filter.active;

    return query;
  }
}
