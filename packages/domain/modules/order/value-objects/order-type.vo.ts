import { BadRequestError } from '../../../errors/app-error';
import { StringVO } from '../../../value-objects';

export const OrderTypeEnum = {
  /** One item bought directly, so the order holds exactly one vendor. */
  SINGLE: 'single',
  /** Checkout of a cart, so the order may hold several vendors. */
  CART: 'cart',
} as const;

export type OrderTypeType = (typeof OrderTypeEnum)[keyof typeof OrderTypeEnum];

export class OrderTypeVO extends StringVO {
  private constructor(value: OrderTypeType) {
    super(value);

    if (!Object.values(OrderTypeEnum).includes(this.value as OrderTypeType)) {
      throw new BadRequestError(`Invalid order type: "${this.value}"`);
    }
  }

  static rehydrate(value: OrderTypeType): OrderTypeVO {
    return new OrderTypeVO(value);
  }

  static fromString(value: string): OrderTypeVO {
    if (!Object.values(OrderTypeEnum).includes(value as OrderTypeType)) {
      throw new BadRequestError(`Invalid order type: "${value}"`);
    }
    return new OrderTypeVO(value as OrderTypeType);
  }

  static single(): OrderTypeVO {
    return new OrderTypeVO(OrderTypeEnum.SINGLE);
  }

  static cart(): OrderTypeVO {
    return new OrderTypeVO(OrderTypeEnum.CART);
  }

  /**
   * A direct multi-item order is only "single" while it stays with one vendor;
   * as soon as it spans vendors it is shaped like a cart order.
   */
  static forVendors(vendorCount: number): OrderTypeVO {
    if (vendorCount < 1) {
      throw new BadRequestError('An order needs at least one vendor.');
    }
    return vendorCount === 1 ? OrderTypeVO.single() : OrderTypeVO.cart();
  }

  get orderType(): OrderTypeType {
    return this.value as OrderTypeType;
  }
}
