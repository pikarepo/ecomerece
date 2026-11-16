import { AggregateRoot } from '../../aggregate-root';
import { BadRequestError } from '../../errors/app-error';
import { DeleteInfoVO, EffectiveDate, type Id, Quantity, type Reason } from '../../value-objects';
import { CouponActivatedEvent } from './events/coupon-activated.event';
import { CouponCreatedEvent } from './events/coupon-created.event';
import { CouponDeactivatedEvent } from './events/coupon-deactivated.event';
import { CouponDeletedEvent } from './events/coupon-deleted.event';
import { CouponRecoveredEvent } from './events/coupon-recovered.event';
import { CouponRedeemedEvent } from './events/coupon-redeemed.event';
import { CouponUpdatedEvent } from './events/coupon-updated.event';
import type { CouponCodeVO } from './value-objects/coupon-code.vo';
import type { DiscountTypeVO } from './value-objects/discount-type.vo';

export type CouponProps = {
  id: Id;
  code: CouponCodeVO;
  discountType: DiscountTypeVO;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  maxRedemptions: number | null;
  perBuyerLimit: number;
  startsAt: Date;
  expiresAt: Date | null;
  active: boolean;
};

export type CouponUpdateProps = Omit<CouponProps, 'id' | 'code'> & { code: CouponCodeVO };

/**
 * A discount code. Percentages are capped by `maxDiscountAmount` so a 20% code
 * on a large basket cannot discount more than the campaign intended, and fixed
 * codes never discount more than the subtotal itself.
 */
export class CouponAggregate extends AggregateRoot {
  constructor(
    private readonly _id: Id,
    private _code: CouponCodeVO,
    private _discountType: DiscountTypeVO,
    private _discountValue: number,
    private _minOrderAmount: number,
    private _maxDiscountAmount: number | null,
    private _maxRedemptions: number | null,
    private _perBuyerLimit: number,
    private _redemptionCount: number,
    private _startsAt: Date,
    private _expiresAt: Date | null,
    private _active: boolean,
    private _delete: DeleteInfoVO,
    private readonly _version: Quantity,
    private readonly _createdAt: EffectiveDate,
  ) {
    super();

    this.assertValidNumbers();
  }

  get id() {
    return this._id;
  }
  get code() {
    return this._code;
  }
  get discountType() {
    return this._discountType;
  }
  get discountValue() {
    return this._discountValue;
  }
  get minOrderAmount() {
    return this._minOrderAmount;
  }
  get maxDiscountAmount() {
    return this._maxDiscountAmount;
  }
  get maxRedemptions() {
    return this._maxRedemptions;
  }
  get perBuyerLimit() {
    return this._perBuyerLimit;
  }
  get redemptionCount() {
    return this._redemptionCount;
  }
  get startsAt() {
    return this._startsAt;
  }
  get expiresAt() {
    return this._expiresAt;
  }
  get active() {
    return this._active;
  }
  get delete() {
    return this._delete;
  }
  get version() {
    return this._version;
  }
  get createdAt() {
    return this._createdAt;
  }

  static create(data: CouponProps): CouponAggregate {
    return new CouponAggregate(
      data.id,
      data.code,
      data.discountType,
      data.discountValue,
      data.minOrderAmount,
      data.maxDiscountAmount,
      data.maxRedemptions,
      data.perBuyerLimit,
      0,
      data.startsAt,
      data.expiresAt,
      data.active,
      DeleteInfoVO.none(),
      Quantity.none(),
      EffectiveDate.today(),
    );
  }

  static rehydrate(
    _id: Id,
    _code: CouponCodeVO,
    _discountType: DiscountTypeVO,
    _discountValue: number,
    _minOrderAmount: number,
    _maxDiscountAmount: number | null,
    _maxRedemptions: number | null,
    _perBuyerLimit: number,
    _redemptionCount: number,
    _startsAt: Date,
    _expiresAt: Date | null,
    _active: boolean,
    _delete: DeleteInfoVO,
    _version: Quantity,
    _createdAt: EffectiveDate,
  ): CouponAggregate {
    return new CouponAggregate(
      _id,
      _code,
      _discountType,
      _discountValue,
      _minOrderAmount,
      _maxDiscountAmount,
      _maxRedemptions,
      _perBuyerLimit,
      _redemptionCount,
      _startsAt,
      _expiresAt,
      _active,
      _delete,
      _version,
      _createdAt,
    );
  }

  createCoupon(actorId: Id) {
    this.raise(new CouponCreatedEvent({ couponId: this._id, code: this._code.value, actorId }));
  }

  update(details: CouponUpdateProps, actorId: Id) {
    this.ensureNotDeleted();

    this._code = details.code;
    this._discountType = details.discountType;
    this._discountValue = details.discountValue;
    this._minOrderAmount = details.minOrderAmount;
    this._maxDiscountAmount = details.maxDiscountAmount;
    this._maxRedemptions = details.maxRedemptions;
    this._perBuyerLimit = details.perBuyerLimit;
    this._startsAt = details.startsAt;
    this._expiresAt = details.expiresAt;
    this._active = details.active;
    this.assertValidNumbers();

    this.raise(new CouponUpdatedEvent({ couponId: this._id, actorId }));
  }

  activate(actorId: Id) {
    this.ensureNotDeleted();
    if (this._active) throw new BadRequestError('Coupon is already active.');

    this._active = true;
    this.raise(new CouponActivatedEvent({ couponId: this._id, actorId }));
  }

  deactivate(actorId: Id) {
    this.ensureNotDeleted();
    if (!this._active) throw new BadRequestError('Coupon is already inactive.');

    this._active = false;
    this.raise(new CouponDeactivatedEvent({ couponId: this._id, actorId }));
  }

  /** Percentage is applied to the subtotal and capped; fixed never exceeds it. */
  calculateDiscount(subtotal: number): number {
    if (subtotal <= 0) return 0;

    const raw = this._discountType.isPercentage
      ? (subtotal * this._discountValue) / 100
      : this._discountValue;

    const capped = this._maxDiscountAmount === null ? raw : Math.min(raw, this._maxDiscountAmount);

    return Math.round(Math.min(capped, subtotal) * 100) / 100;
  }

  /**
   * Returns the refusal reason instead of throwing, because the validate route
   * answers 200 with `valid: false` — a wrong code is not a malformed request.
   */
  refusalReason(
    subtotal: number,
    buyerRedemptionCount: number,
    at: Date = new Date(),
  ): string | null {
    if (this._delete.isDeleted) return 'This coupon no longer exists.';
    if (!this._active) return 'This coupon is not active.';
    if (at.getTime() < this._startsAt.getTime()) return 'This coupon is not valid yet.';
    if (this._expiresAt && at.getTime() > this._expiresAt.getTime()) {
      return 'This coupon has expired.';
    }
    if (this._maxRedemptions !== null && this._redemptionCount >= this._maxRedemptions) {
      return 'This coupon has reached its redemption limit.';
    }
    if (buyerRedemptionCount >= this._perBuyerLimit) {
      return 'You have already used this coupon the maximum number of times.';
    }
    if (subtotal < this._minOrderAmount) {
      return `This coupon requires a minimum order of ${this._minOrderAmount}.`;
    }
    return null;
  }

  redeem(params: {
    buyerId: Id;
    orderId: Id;
    subtotal: number;
    buyerRedemptionCount: number;
    actorId: Id;
    at?: Date;
  }) {
    this.ensureNotDeleted();

    const refusal = this.refusalReason(
      params.subtotal,
      params.buyerRedemptionCount,
      params.at ?? new Date(),
    );
    if (refusal) throw new BadRequestError(refusal);

    const discountAmount = this.calculateDiscount(params.subtotal);
    this._redemptionCount += 1;

    this.raise(
      new CouponRedeemedEvent({
        couponId: this._id,
        buyerId: params.buyerId,
        orderId: params.orderId,
        discountAmount,
      }),
    );

    return discountAmount;
  }

  deleteCoupon(reason: Reason, actorId: Id) {
    if (this._delete.isDeleted) {
      throw new BadRequestError('Coupon is already deleted.');
    }

    this._delete = DeleteInfoVO.create(actorId, reason);
    this.raise(new CouponDeletedEvent({ couponId: this._id, reason, actorId }));
  }

  recoverCoupon(actorId: Id) {
    if (!this._delete.isDeleted) {
      throw new BadRequestError('Coupon is not deleted.');
    }

    this._delete = DeleteInfoVO.none();
    this.raise(new CouponRecoveredEvent({ couponId: this._id, actorId }));
  }

  /** Keeps the numbers inside the range every downstream calculation assumes. */
  private assertValidNumbers(): void {
    if (!Number.isFinite(this._discountValue) || this._discountValue <= 0) {
      throw new BadRequestError('Discount value must be greater than zero.');
    }
    if (this._discountType.isPercentage && this._discountValue > 100) {
      throw new BadRequestError('A percentage discount cannot exceed 100.');
    }
    if (this._minOrderAmount < 0) {
      throw new BadRequestError('Minimum order amount cannot be negative.');
    }
    if (this._maxDiscountAmount !== null && this._maxDiscountAmount <= 0) {
      throw new BadRequestError('Maximum discount amount must be greater than zero.');
    }
    if (this._perBuyerLimit < 1) {
      throw new BadRequestError('Per-buyer limit must be at least 1.');
    }
    if (this._maxRedemptions !== null && this._maxRedemptions < 1) {
      throw new BadRequestError('Max redemptions must be at least 1.');
    }
    if (this._expiresAt && this._expiresAt.getTime() <= this._startsAt.getTime()) {
      throw new BadRequestError('Coupon must expire after it starts.');
    }
  }

  private ensureNotDeleted(): void {
    if (this._delete.isDeleted) {
      throw new BadRequestError('Cannot perform operation on a deleted coupon.');
    }
  }
}
