import type { Id, Quantity } from '../../../value-objects';
import type { CouponAggregate } from '../promotions.aggregate';

export interface CouponPaginationFilter {
  active?: boolean;
  code?: string;
  deleted?: boolean;
}

export interface CouponPage {
  data: CouponAggregate[];
  meta: {
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
  };
}

export interface CouponRedemptionInput {
  couponId: Id;
  orderId: Id;
  buyerId: Id;
  discountAmount: number;
}

export interface ICouponRepository {
  FindById(id: Id): Promise<CouponAggregate | null>;
  FindByCode(code: string): Promise<CouponAggregate | null>;
  FindPaginated(params: {
    filter?: CouponPaginationFilter;
    cursor?: Id;
    limit?: Quantity;
    direction?: 'next' | 'prev';
  }): Promise<CouponPage>;
  Create(coupon: CouponAggregate): Promise<void>;
  Save(coupon: CouponAggregate): Promise<void>;
  Delete(id: Id): Promise<void>;
  Exists(id: Id): Promise<boolean>;
  CountRedemptionsByBuyer(couponId: Id, buyerId: Id): Promise<number>;
  /** Records the redemption; `(couponId, orderId)` is unique so retries are no-ops. */
  CreateRedemption(redemption: CouponRedemptionInput): Promise<void>;
  HasRedeemed(couponId: Id, orderId: Id): Promise<boolean>;
}
