import { BadRequestError } from '../../../errors/app-error';
import { StringVO } from '../../../value-objects';

/**
 * Codes are typed by buyers and printed on campaigns, so they are normalised to
 * upper case and restricted to characters that survive copy/paste.
 */
export class CouponCodeVO extends StringVO {
  private static readonly ALLOWED = /^[A-Z0-9-]{3,32}$/;

  private constructor(value: string) {
    super(value.trim().toUpperCase());

    if (!CouponCodeVO.ALLOWED.test(this.value)) {
      throw new BadRequestError(
        'Coupon code must be 3-32 characters of letters, digits or hyphens.',
      );
    }
  }

  static create(value: string): CouponCodeVO {
    return new CouponCodeVO(value);
  }

  static rehydrate(value: string): CouponCodeVO {
    return new CouponCodeVO(value);
  }
}
