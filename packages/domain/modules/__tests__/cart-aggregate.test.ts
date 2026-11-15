import { describe, expect, it } from 'bun:test';
import { BadRequestError } from '../../errors/app-error';
import { Id, Quantity, Reason } from '../../value-objects';
import { CartAggregate } from '../cart/cart.aggregate';
import { CartItemVO } from '../cart/value-objects/cart-item.vo';

const id = (n: number) => Id.create(`00000000-0000-7000-8000-${String(n).padStart(12, '0')}`);
const reason = () => Reason.create('violates the marketplace policy');
const buyer = () => id(7);
const otherBuyer = () => id(8);

function cart() {
  return CartAggregate.create({ id: id(1), buyerId: buyer() });
}

function cartWithItem(quantity = 2) {
  const aggregate = cart();
  const item = aggregate.addItem(id(301), Quantity.create(quantity), buyer());
  aggregate.clearEvents();
  return { aggregate, item };
}

describe('CartAggregate creation', () => {
  it('starts empty, undeleted and raises cart.created', () => {
    const aggregate = cart();

    expect(aggregate.items).toEqual([]);
    expect(aggregate.delete.isDeleted).toBe(false);
    expect(aggregate.buyerId).toEqual(buyer());
    const [event] = aggregate.pullEvents();
    expect(event?.type).toBe('cart.created');
    expect(event?.payload).toMatchObject({ cartId: aggregate.id, buyerId: buyer() });
  });
});

describe('CartAggregate adding lines', () => {
  it('adds a new variant as its own line', () => {
    const { aggregate, item } = cartWithItem(2);

    expect(aggregate.items).toHaveLength(1);
    expect(item.quantity.value).toBe(2);
    expect(item.variantId).toEqual(id(301));
  });

  it('merges the same variant into one line with the summed quantity', () => {
    const aggregate = cart();
    const first = aggregate.addItem(id(301), Quantity.create(2), buyer());
    const second = aggregate.addItem(Id.create(id(301).value), Quantity.create(3), buyer());

    expect(aggregate.items).toHaveLength(1);
    expect(second.id).toEqual(first.id);
    expect(second.quantity.value).toBe(5);
    const last = aggregate.pullEvents().at(-1);
    expect(last?.type).toBe('cart.item-added');
    expect(last?.payload).toMatchObject({ cartItemId: first.id, variantId: id(301) });
  });

  it('keeps distinct variants on separate lines', () => {
    const aggregate = cart();
    aggregate.addItem(id(301), Quantity.create(1), buyer());
    aggregate.addItem(id(302), Quantity.create(1), buyer());

    expect(aggregate.items.map((item) => item.variantId.value)).toEqual([
      id(301).value,
      id(302).value,
    ]);
  });

  it('refuses a zero-quantity line', () => {
    expect(() => cart().addItem(id(301), Quantity.none(), buyer())).toThrow(BadRequestError);
  });

  it('refuses a line for a cart the actor does not own', () => {
    expect(() => cart().addItem(id(301), Quantity.create(1), otherBuyer())).toThrow(
      'You do not own this cart.',
    );
  });

  it('refuses additions to a deleted cart', () => {
    const aggregate = cart();
    aggregate.deleteCart(reason(), id(9));

    expect(() => aggregate.addItem(id(301), Quantity.create(1), buyer())).toThrow(
      'This cart has been removed.',
    );
  });

  it('does not let a caller mutate the internal line list', () => {
    const { aggregate } = cartWithItem(1);
    aggregate.items.push(CartItemVO.create(id(302), Quantity.create(1)));

    expect(aggregate.items).toHaveLength(1);
  });
});

describe('CartAggregate selection', () => {
  it('selects existing lines without changing the cart', () => {
    const { aggregate, item } = cartWithItem(2);

    const selected = aggregate.selectItems([item.id]);

    expect(selected).toHaveLength(1);
    expect(aggregate.items).toHaveLength(1);
    expect(aggregate.pullEvents()).toEqual([]);
  });

  it('requires at least one selected line', () => {
    expect(() => cartWithItem().aggregate.selectItems([])).toThrow(BadRequestError);
  });

  it('refuses an unknown line id', () => {
    expect(() => cartWithItem().aggregate.selectItems([id(999)])).toThrow(BadRequestError);
  });

  it('refuses selection on a deleted cart', () => {
    const { aggregate, item } = cartWithItem();
    aggregate.deleteCart(reason(), id(9));

    expect(() => aggregate.selectItems([item.id])).toThrow(BadRequestError);
  });
});

describe('CartAggregate checkout', () => {
  it('removes only the selected lines and raises one checked-out event', () => {
    const aggregate = cart();
    const kept = aggregate.addItem(id(301), Quantity.create(1), buyer());
    const ordered = aggregate.addItem(id(302), Quantity.create(2), buyer());
    aggregate.clearEvents();
    const orderId = id(500);

    const selected = aggregate.checkoutSelected([ordered.id], orderId, buyer());

    expect(selected.map((item) => item.id.value)).toEqual([ordered.id.value]);
    expect(aggregate.items.map((item) => item.id.value)).toEqual([kept.id.value]);
    const [event] = aggregate.pullEvents();
    expect(event?.type).toBe('cart.checked-out');
    expect(event?.payload).toMatchObject({
      cartId: aggregate.id,
      orderId,
      cartItemIds: [ordered.id],
    });
  });

  it('leaves the cart untouched when a line is already gone', () => {
    const { aggregate, item } = cartWithItem(1);
    aggregate.checkoutSelected([item.id], id(500), buyer());

    expect(() => aggregate.checkoutSelected([item.id], id(501), buyer())).toThrow(BadRequestError);
    expect(aggregate.items).toEqual([]);
  });

  it('refuses checkout by a different buyer', () => {
    const { aggregate, item } = cartWithItem(1);

    expect(() => aggregate.checkoutSelected([item.id], id(500), otherBuyer())).toThrow(
      'You do not own this cart.',
    );
    expect(aggregate.items).toHaveLength(1);
  });

  it('refuses checkout on a deleted cart', () => {
    const { aggregate, item } = cartWithItem(1);
    aggregate.deleteCart(reason(), id(9));

    expect(() => aggregate.checkoutSelected([item.id], id(500), buyer())).toThrow(BadRequestError);
  });
});

describe('CartAggregate deletion', () => {
  it('deletes once and raises one event with audit data', () => {
    const aggregate = cart();
    aggregate.clearEvents();

    aggregate.deleteCart(reason(), id(9));

    expect(aggregate.delete.isDeleted).toBe(true);
    const [event] = aggregate.pullEvents();
    expect(event?.type).toBe('cart.deleted');
    expect(event?.payload).toMatchObject({ actorId: id(9), deletionInfo: aggregate.delete });
    expect(() => aggregate.deleteCart(reason(), id(9))).toThrow('Cart is already deleted.');
  });
});
