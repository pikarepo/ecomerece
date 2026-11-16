import type { Id } from '@ecomerece/domain';

export interface CouponValidationResult {
  valid: boolean;
  discountAmount: number;
  reason: string | null;
}

export interface CouponRedemptionInput {
  code: string;
  buyerId: Id;
  orderId: Id;
  subtotal: number;
}

export interface CouponRedemptionResult {
  couponId: Id;
  discountAmount: number;
}

/**
 * Cross-module read port for pricing previews (cart, checkout UI). It never
 * mutates a coupon, so it is safe to call on every keystroke.
 */
export interface ICouponQueries {
  validateCode(code: string, subtotal: number, buyerId: Id): Promise<CouponValidationResult>;
}

/**
 * Cross-module write port. Checkout must redeem exactly once per order; the
 * redemption record's `(couponId, orderId)` uniqueness makes retries safe.
 */
export interface ICouponWriter {
  redeem(input: CouponRedemptionInput): Promise<CouponRedemptionResult>;
}
