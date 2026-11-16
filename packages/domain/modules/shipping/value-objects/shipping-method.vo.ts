import { BadRequestError } from '../../../errors/app-error';
import { StringVO } from '../../../value-objects';

export const ShippingMethodEnum = {
  STANDARD: 'standard',
  EXPRESS: 'express',
  OVERNIGHT: 'overnight',
  SAME_DAY: 'same_day',
} as const;

export type ShippingMethodType = (typeof ShippingMethodEnum)[keyof typeof ShippingMethodEnum];

/** Service level the buyer paid for; drives the ETA and the rate estimate. */
export class ShippingMethodVO extends StringVO {
  private constructor(value: ShippingMethodType) {
    super(value);

    if (!Object.values(ShippingMethodEnum).includes(this.value as ShippingMethodType)) {
      throw new BadRequestError(`Invalid shipping method: "${this.value}"`);
    }
  }

  static create(value: string): ShippingMethodVO {
    if (!Object.values(ShippingMethodEnum).includes(value as ShippingMethodType)) {
      throw new BadRequestError(`Invalid shipping method: "${value}"`);
    }
    return new ShippingMethodVO(value as ShippingMethodType);
  }

  static rehydrate(value: string): ShippingMethodVO {
    return ShippingMethodVO.create(value);
  }

  get shippingMethod(): ShippingMethodType {
    return this.value as ShippingMethodType;
  }

  /** Typical door-to-door days for the service level. */
  get transitDays(): number {
    switch (this.shippingMethod) {
      case ShippingMethodEnum.SAME_DAY:
        return 0;
      case ShippingMethodEnum.OVERNIGHT:
        return 1;
      case ShippingMethodEnum.EXPRESS:
        return 2;
      default:
        return 5;
    }
  }
}
