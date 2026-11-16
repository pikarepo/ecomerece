import { BadRequestError } from '../../../errors/app-error';
import { StringVO } from '../../../value-objects';

export const PaymentTransactionTypeEnum = {
  AUTHORIZATION: 'authorization',
  CAPTURE: 'capture',
  REFUND: 'refund',
  VOID: 'void',
} as const;

export type PaymentTransactionType =
  (typeof PaymentTransactionTypeEnum)[keyof typeof PaymentTransactionTypeEnum];

export class PaymentTransactionTypeVO extends StringVO {
  private constructor(value: PaymentTransactionType) {
    super(value);
  }

  static create(value: string): PaymentTransactionTypeVO {
    if (!Object.values(PaymentTransactionTypeEnum).includes(value as PaymentTransactionType)) {
      throw new BadRequestError(`Invalid payment transaction type: "${value}"`);
    }
    return new PaymentTransactionTypeVO(value as PaymentTransactionType);
  }

  static rehydrate(value: PaymentTransactionType): PaymentTransactionTypeVO {
    return new PaymentTransactionTypeVO(value);
  }

  static authorization(): PaymentTransactionTypeVO {
    return new PaymentTransactionTypeVO(PaymentTransactionTypeEnum.AUTHORIZATION);
  }
  static capture(): PaymentTransactionTypeVO {
    return new PaymentTransactionTypeVO(PaymentTransactionTypeEnum.CAPTURE);
  }
  static refund(): PaymentTransactionTypeVO {
    return new PaymentTransactionTypeVO(PaymentTransactionTypeEnum.REFUND);
  }
  static void(): PaymentTransactionTypeVO {
    return new PaymentTransactionTypeVO(PaymentTransactionTypeEnum.VOID);
  }
}
