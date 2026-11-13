import { BadRequestError } from '../../../errors/app-error';
import { StringVO } from '../../../value-objects';

export const OrderStatusEnum = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  RETURNED: 'returned',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
} as const;

export type OrderStatusType = (typeof OrderStatusEnum)[keyof typeof OrderStatusEnum];

export class OrderStatusVO extends StringVO {
  private constructor(value: OrderStatusType) {
    super(value);

    if (!Object.values(OrderStatusEnum).includes(this.value as OrderStatusType)) {
      throw new BadRequestError(`Invalid order status: "${this.value}"`);
    }
  }

  static rehydrate(value: OrderStatusType): OrderStatusVO {
    return new OrderStatusVO(value);
  }

  static pending(): OrderStatusVO {
    return new OrderStatusVO(OrderStatusEnum.PENDING);
  }

  static fromString(value: string): OrderStatusVO {
    if (!Object.values(OrderStatusEnum).includes(value as OrderStatusType)) {
      throw new BadRequestError(`Invalid order status: "${value}"`);
    }
    return new OrderStatusVO(value as OrderStatusType);
  }

  confirm(): OrderStatusVO {
    if (this.value !== OrderStatusEnum.PENDING) {
      throw new BadRequestError(
        `Cannot confirm an order that is not pending (current: ${this.value})`,
      );
    }
    return new OrderStatusVO(OrderStatusEnum.CONFIRMED);
  }

  complete(): OrderStatusVO {
    if (this.value !== OrderStatusEnum.CONFIRMED) {
      throw new BadRequestError(
        `Cannot complete an order that is not confirmed (current: ${this.value})`,
      );
    }
    return new OrderStatusVO(OrderStatusEnum.COMPLETED);
  }

  cancel(): OrderStatusVO {
    if (
      this.value === OrderStatusEnum.COMPLETED ||
      this.value === OrderStatusEnum.REFUNDED ||
      this.value === OrderStatusEnum.CANCELLED
    ) {
      throw new BadRequestError(`Cannot cancel a ${this.value} order.`);
    }
    return new OrderStatusVO(OrderStatusEnum.CANCELLED);
  }

  return(): OrderStatusVO {
    if (
      this.value !== OrderStatusEnum.CONFIRMED &&
      this.value !== OrderStatusEnum.COMPLETED
    ) {
      throw new BadRequestError(
        `Cannot return an order that is not confirmed or completed (current: ${this.value})`,
      );
    }
    return new OrderStatusVO(OrderStatusEnum.RETURNED);
  }

  refund(): OrderStatusVO {
    if (this.value === OrderStatusEnum.REFUNDED) {
      throw new BadRequestError('Cannot refund an order that is already refunded.');
    }
    if (
      this.value !== OrderStatusEnum.CONFIRMED &&
      this.value !== OrderStatusEnum.COMPLETED &&
      this.value !== OrderStatusEnum.RETURNED
    ) {
      throw new BadRequestError(
        `Cannot refund an order that is not confirmed, completed, or returned (current: ${this.value})`,
      );
    }
    return new OrderStatusVO(OrderStatusEnum.REFUNDED);
  }

  get status(): OrderStatusType {
    return this.value as OrderStatusType;
  }

  /**
   * Permission for retrying rejected items: only an order that can still change
   * may be re-priced. A completed, cancelled, returned or refunded order is
   * final, so its total must never move again.
   */
  ensureItemsRetryable(): void {
    if (
      this.value === OrderStatusEnum.COMPLETED ||
      this.value === OrderStatusEnum.CANCELLED ||
      this.value === OrderStatusEnum.RETURNED ||
      this.value === OrderStatusEnum.REFUNDED
    ) {
      throw new BadRequestError(`Cannot retry items on a ${this.value} order.`);
    }
  }
}
