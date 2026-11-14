import { BadRequestError } from '../../../errors/app-error';
import { EffectiveDate, Id, Quantity } from '../../../value-objects';

export type CartItemProps = {
  id: Id;
  variantId: Id;
  quantity: Quantity;
  addedAt: EffectiveDate;
};

/**
 * One variant the buyer put aside. The cart never stores prices or vendors:
 * the order module re-resolves both at checkout so a stale cart can never
 * decide what the buyer pays or who fulfils the line.
 */
export class CartItemVO {
  private constructor(
    private readonly _id: Id,
    private readonly _variantId: Id,
    private _quantity: Quantity,
    private readonly _addedAt: EffectiveDate,
  ) {}

  get id() {
    return this._id;
  }
  get variantId() {
    return this._variantId;
  }
  get quantity() {
    return this._quantity;
  }
  get addedAt() {
    return this._addedAt;
  }

  static create(variantId: Id, quantity: Quantity): CartItemVO {
    if (!quantity.isPositive) {
      throw new BadRequestError('A cart line needs a quantity of at least one.');
    }
    return new CartItemVO(Id.create(), variantId, quantity, EffectiveDate.today());
  }

  static rehydrate(id: Id, variantId: Id, quantity: Quantity, addedAt: EffectiveDate): CartItemVO {
    return new CartItemVO(id, variantId, quantity, addedAt);
  }

  /** The same variant may already sit in the cart, so quantities add up. */
  addQuantity(quantity: Quantity): CartItemVO {
    return new CartItemVO(
      this._id,
      this._variantId,
      this._quantity.increase(quantity.value),
      this._addedAt,
    );
  }
}
