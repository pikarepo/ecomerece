import { type Id, Quantity } from '../../../value-objects';

export type OrderItemProps = {
  variantId: Id;
  quantity: Quantity;
  unitPrice: Quantity;
};

export class OrderItem {
  private constructor(
    public readonly _variantId: Id,
    public readonly _quantity: Quantity,
    public readonly _unitPrice: Quantity,
  ) {}

  get totalPrice(): Quantity {
    return new Quantity(this._unitPrice.value * this._quantity.value);
  }
  get variantId(): Id {
    return this._variantId;
  }
  get quantity(): Quantity {
    return this._quantity;
  }
  get _nitPrice(): Quantity {
    return this._unitPrice;
  }

  static create(props: OrderItemProps): OrderItem {
    return new OrderItem(props.variantId, props.quantity, props.unitPrice);
  }
  static rehydrate(variantId: Id, quantity: Quantity, unitPrice: Quantity): OrderItem {
    return new OrderItem(variantId, quantity, unitPrice);
  }
}
