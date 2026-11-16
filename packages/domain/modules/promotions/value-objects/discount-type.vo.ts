import { BadRequestError } from '../../../errors/app-error';
import { StringVO } from '../../../value-objects';

export const DiscountTypeEnum = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
} as const;

export type DiscountTypeValue = (typeof DiscountTypeEnum)[keyof typeof DiscountTypeEnum];

export class DiscountTypeVO extends StringVO {
  private constructor(value: DiscountTypeValue) {
    super(value);

    if (!Object.values(DiscountTypeEnum).includes(this.value as DiscountTypeValue)) {
      throw new BadRequestError(`Invalid discount type: "${this.value}"`);
    }
  }

  static create(value: string): DiscountTypeVO {
    if (!Object.values(DiscountTypeEnum).includes(value as DiscountTypeValue)) {
      throw new BadRequestError(`Invalid discount type: "${value}"`);
    }
    return new DiscountTypeVO(value as DiscountTypeValue);
  }

  static rehydrate(value: string): DiscountTypeVO {
    return DiscountTypeVO.create(value);
  }

  get discountType(): DiscountTypeValue {
    return this.value as DiscountTypeValue;
  }

  get isPercentage(): boolean {
    return this.value === DiscountTypeEnum.PERCENTAGE;
  }
}
