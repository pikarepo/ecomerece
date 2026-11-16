import { BadRequestError } from '../../../errors/app-error';
import { StringVO } from '../../../value-objects';

export const ReturnTypeEnum = {
  REFUND: 'refund',
  REPLACEMENT: 'replacement',
} as const;

export type ReturnTypeValue = (typeof ReturnTypeEnum)[keyof typeof ReturnTypeEnum];

/**
 * What the buyer expects back. A refund ends the transaction for the returned
 * units; a replacement sends the same units again, so no money moves.
 */
export class ReturnTypeVO extends StringVO {
  private constructor(value: ReturnTypeValue) {
    super(value);

    if (!Object.values(ReturnTypeEnum).includes(this.value as ReturnTypeValue)) {
      throw new BadRequestError(`Invalid return type: "${this.value}"`);
    }
  }

  static create(value: string): ReturnTypeVO {
    if (!Object.values(ReturnTypeEnum).includes(value as ReturnTypeValue)) {
      throw new BadRequestError(`Invalid return type: "${value}"`);
    }
    return new ReturnTypeVO(value as ReturnTypeValue);
  }

  static refund(): ReturnTypeVO {
    return new ReturnTypeVO(ReturnTypeEnum.REFUND);
  }

  static rehydrate(value: string): ReturnTypeVO {
    return ReturnTypeVO.create(value);
  }

  get returnType(): ReturnTypeValue {
    return this.value as ReturnTypeValue;
  }

  get isRefund(): boolean {
    return this.value === ReturnTypeEnum.REFUND;
  }
}
