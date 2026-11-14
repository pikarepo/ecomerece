import { AggregateRoot } from '../../aggregate-root';
import { BadRequestError } from '../../errors/app-error';
import { DeleteInfoVO, EffectiveDate, type Id, Quantity, type Reason } from '../../value-objects';
import {
  CartCheckedOutEvent,
  CartCreatedEvent,
  CartDeletedEvent,
  CartItemAddedEvent,
} from './events';
import { CartItemVO } from './value-objects/cart-item.vo';

export type CreateCartProps = {
  id: Id;
  buyerId: Id;
};

/**
 * The buyer's one permanent cart: there is no way to delete it, and its lines
 * are the only lines that can be ordered.
 *
 * A cart only remembers *which* variants and how many; prices, availability and
 * vendors are re-resolved by the order module at checkout. Checkout itself is
 * cross-module: the cart app service asks the order module (through
 * `IOrderWriter`) for one order covering every selected line, then removes the
 * ordered lines, so whatever stays in the cart is still active.
 */
export class CartAggregate extends AggregateRoot {
  constructor(
    private readonly _id: Id,
    private readonly _buyerId: Id,
    private _items: CartItemVO[],
    private _delete: DeleteInfoVO,
    private readonly _version: Quantity,
    private readonly _createdAt: EffectiveDate,
  ) {
    super();
  }

  get id() {
    return this._id;
  }
  get buyerId() {
    return this._buyerId;
  }
  get items(): CartItemVO[] {
    return [...this._items];
  }
  get delete() {
    return this._delete;
  }
  get version() {
    return this._version;
  }
  get createdAt() {
    return this._createdAt;
  }

  static create(data: CreateCartProps): CartAggregate {
    const cart = new CartAggregate(
      data.id,
      data.buyerId,
      [],
      DeleteInfoVO.none(),
      Quantity.none(),
      EffectiveDate.today(),
    );
    cart.raise(new CartCreatedEvent({ cartId: cart._id, buyerId: cart._buyerId }));

    return cart;
  }

  static rehydrate(
    _id: Id,
    _buyerId: Id,
    _items: CartItemVO[],
    _delete: DeleteInfoVO,
    _version: Quantity,
    _createdAt: EffectiveDate,
  ): CartAggregate {
    return new CartAggregate(_id, _buyerId, _items, _delete, _version, _createdAt);
  }

  /**
   * The same variant added twice stays one line with the summed quantity, so a
   * buyer cannot end up with two prices for the same variant in one checkout.
   */
  addItem(variantId: Id, quantity: Quantity, actorId: Id): CartItemVO {
    this.ensureOwnedBy(actorId);
    this.ensureNotDeleted();

    const existing = this._items.find((item) => item.variantId.equals(variantId));
    const item = existing ? existing.addQuantity(quantity) : CartItemVO.create(variantId, quantity);

    this._items = existing
      ? this._items.map((line) => (line.id.equals(item.id) ? item : line))
      : [...this._items, item];

    this.raise(
      new CartItemAddedEvent({
        cartId: this._id,
        buyerId: this._buyerId,
        cartItemId: item.id,
        variantId,
        quantity: item.quantity,
      }),
    );

    return item;
  }

  /**
   * The selected lines, without changing the cart. The checkout reads this
   * first because the order module decides whether they can actually be bought.
   * Only lines still in the cart are selectable, so an already ordered (or
   * unknown) line can never be bought twice.
   */
  selectItems(cartItemIds: Id[]): CartItemVO[] {
    this.ensureNotDeleted();
    if (cartItemIds.length === 0) {
      throw new BadRequestError('Select at least one cart item to order.');
    }

    return cartItemIds.map((id) => {
      const item = this._items.find((line) => line.id.equals(id));
      if (!item) throw new BadRequestError(`Cart item ${id.value} not found.`);
      return item;
    });
  }

  /** Removes the ordered lines once the single order covering them was created. */
  checkoutSelected(cartItemIds: Id[], orderId: Id, actorId: Id): CartItemVO[] {
    this.ensureOwnedBy(actorId);
    const selected = this.selectItems(cartItemIds);

    this._items = this._items.filter((item) => !selected.some((line) => line.id.equals(item.id)));
    this.raise(
      new CartCheckedOutEvent({
        cartId: this._id,
        buyerId: this._buyerId,
        orderId,
        cartItemIds: selected.map((item) => item.id),
      }),
    );

    return selected;
  }

  /** Admin-only: a buyer can never delete their own cart. */
  deleteCart(reason: Reason, actorId: Id): void {
    if (this._delete.isDeleted) {
      throw new BadRequestError('Cart is already deleted.');
    }
    this._delete = DeleteInfoVO.create(actorId, reason);
    this.raise(
      new CartDeletedEvent({
        cartId: this._id,
        buyerId: this._buyerId,
        actorId,
        deletionInfo: this._delete,
      }),
    );
  }

  private ensureOwnedBy(actorId: Id): void {
    if (!this._buyerId.equals(actorId)) {
      throw new BadRequestError('You do not own this cart.');
    }
  }

  private ensureNotDeleted(): void {
    if (this._delete.isDeleted) {
      throw new BadRequestError('This cart has been removed.');
    }
  }
}
