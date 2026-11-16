import type {
  CouponRedemptionInput,
  CouponRedemptionResult,
  CouponValidationResult,
  ICouponQueries,
  ICouponWriter,
} from '@ecomerece/contracts';
import type { Id } from '@ecomerece/domain/value-objects';
import type { PromotionsApplicationService } from './promotions.app.service';

/** Contract-facing read adapter: a preview must never mutate a coupon. */
export class CouponQueryAdapter implements ICouponQueries {
  constructor(private readonly appService: PromotionsApplicationService) {}

  async validateCode(code: string, subtotal: number, buyerId: Id): Promise<CouponValidationResult> {
    const result = await this.appService.validateCoupon({ code, subtotal, buyerId });

    return {
      valid: result.valid,
      discountAmount: result.discountAmount,
      reason: result.reason,
    };
  }
}

/** Contract-facing write adapter used by checkout once it supports coupons. */
export class CouponWriterAdapter implements ICouponWriter {
  constructor(private readonly appService: PromotionsApplicationService) {}

  redeem(input: CouponRedemptionInput): Promise<CouponRedemptionResult> {
    return this.appService.redeem(input);
  }
}
