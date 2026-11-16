import { BadRequestError } from '../../../errors/app-error';
import { StringVO } from '../../../value-objects';

export const PaymentStatusEnum = {
  PENDING: 'pending',
  AUTHORIZED: 'authorized',
  CAPTURED: 'captured',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded',
} as const;

export type PaymentStatusType = (typeof PaymentStatusEnum)[keyof typeof PaymentStatusEnum];

export class PaymentStatusVO extends StringVO {
  private constructor(value: PaymentStatusType) {
    super(value);
  }

  static pending(): PaymentStatusVO {
    return new PaymentStatusVO(PaymentStatusEnum.PENDING);
  }

  static fromString(value: string): PaymentStatusVO {
    if (!Object.values(PaymentStatusEnum).includes(value as PaymentStatusType)) {
      throw new BadRequestError(`Invalid payment status: "${value}"`);
    }
    return new PaymentStatusVO(value as PaymentStatusType);
  }

  static rehydrate(value: PaymentStatusType): PaymentStatusVO {
    return new PaymentStatusVO(value);
  }

  authorize(): PaymentStatusVO {
    if (this.value !== PaymentStatusEnum.PENDING) {
      throw new BadRequestError(`Cannot authorize a ${this.value} payment.`);
    }
    return new PaymentStatusVO(PaymentStatusEnum.AUTHORIZED);
  }

  capture(): PaymentStatusVO {
    if (this.value !== PaymentStatusEnum.PENDING && this.value !== PaymentStatusEnum.AUTHORIZED) {
      throw new BadRequestError(`Cannot capture a ${this.value} payment.`);
    }
    return new PaymentStatusVO(PaymentStatusEnum.CAPTURED);
  }

  fail(): PaymentStatusVO {
    if (this.value === PaymentStatusEnum.CAPTURED || this.value === PaymentStatusEnum.REFUNDED) {
      throw new BadRequestError(`Cannot fail a ${this.value} payment.`);
    }
    return new PaymentStatusVO(PaymentStatusEnum.FAILED);
  }

  cancel(): PaymentStatusVO {
    if (this.value === PaymentStatusEnum.CAPTURED || this.value === PaymentStatusEnum.REFUNDED) {
      throw new BadRequestError(`Cannot cancel a ${this.value} payment.`);
    }
    return new PaymentStatusVO(PaymentStatusEnum.CANCELLED);
  }

  refund(partial: boolean): PaymentStatusVO {
    if (
      this.value !== PaymentStatusEnum.CAPTURED &&
      this.value !== PaymentStatusEnum.PARTIALLY_REFUNDED
    ) {
      throw new BadRequestError(`Cannot refund a ${this.value} payment.`);
    }
    return new PaymentStatusVO(
      partial ? PaymentStatusEnum.PARTIALLY_REFUNDED : PaymentStatusEnum.REFUNDED,
    );
  }

  get status(): PaymentStatusType {
    return this.value as PaymentStatusType;
  }

  get isSettled(): boolean {
    return (
      this.value === PaymentStatusEnum.CAPTURED ||
      this.value === PaymentStatusEnum.PARTIALLY_REFUNDED
    );
  }
}
