import { describe, expect, it } from 'bun:test';
import type { CreateCartOrderInput } from '@ecomerece/contracts';
import { CartAggregate, CartItemVO } from '@ecomerece/domain';
import type { IEvent } from '@ecomerece/domain/events/event-bus.interface';
import { DeleteInfoVO } from '@ecomerece/domain/value-objects/delete-info.vo';
import { EffectiveDate } from '@ecomerece/domain/value-objects/effective-date.vo';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import { CartApplicationService } from '../cart.app.service';

const id = (n: number) => Id.create(`00000000-0000-7000-8000-${String(n).padStart(12, '0')}`).value;

const actor = { _id: id(1), image: '', name: { fullName: 'Test Buyer' } };
const waitingTime = new Date(Date.now() + 2 * 60 * 60 * 1000);

function buildCart() {
  return CartAggregate.rehydrate(
    Id.create(id(20)),
    Id.create(id(1)),
    [
      CartItemVO.rehydrate(
        Id.create(id(30)),
        Id.create(id(2)),
        Quantity.create(1),
        EffectiveDate.today(),
      ),
      CartItemVO.rehydrate(
        Id.create(id(31)),
        Id.create(id(5)),
        Quantity.create(2),
        EffectiveDate.today(),
      ),
    ],
    DeleteInfoVO.none(),
    Quantity.rehydrate(1),
    EffectiveDate.today(),
  );
}

function buildService(options: { cart?: CartAggregate | null; orderFails?: boolean } = {}) {
  const calls: string[] = [];
  const published: IEvent[] = [];
  const orderInputs: CreateCartOrderInput[] = [];
  const savedItems: number[] = [];
  const createdCarts: CartAggregate[] = [];
  let currentCart = options.cart === undefined ? buildCart() : options.cart;

  const cartRepo = {
    FindByBuyerId: async () => currentCart,
    FindByBuyerIdOrThrow: async () => {
      if (!currentCart) throw new Error('Cart not found.');
      return currentCart;
    },
    FindByIdOrThrow: async () => {
      if (!currentCart) throw new Error('Cart not found.');
      return currentCart;
    },
    Save: async (saved: CartAggregate) => {
      calls.push('save-cart');
      savedItems.push(saved.items.length);
      currentCart = saved;
    },
    Create: async (created: CartAggregate) => {
      calls.push('create-cart');
      createdCarts.push(created);
      currentCart = created;
    },
  };

  const orderWriter = {
    createFromCart: async (input: CreateCartOrderInput) => {
      calls.push('create-order');
      if (options.orderFails) throw new Error('insufficient_stock');
      orderInputs.push(input);
      return {
        orderId: Id.create(id(40)),
        orderType: 'cart',
        vendorIds: [id(4), id(7)],
        totalPrice: 30,
        createdAt: new Date(),
      };
    },
  };

  const eventBus = {
    publish: async (events: IEvent | IEvent[]) => {
      calls.push('publish');
      published.push(...(Array.isArray(events) ? events : [events]));
    },
  };

  const service = new CartApplicationService(
    cartRepo as never,
    orderWriter as never,
    eventBus as never,
  );

  return { service, calls, published, orderInputs, savedItems, createdCarts };
}

describe('CartApplicationService.checkoutItems', () => {
  it('orders every selected line as one order and empties them from the cart', async () => {
    const { service, calls, published, orderInputs, savedItems } = buildService();

    const result = await service.checkoutItems(
      { idempotentKey: id(12), addressId: id(11), waitingTime, cartItemIds: [id(30), id(31)] },
      actor,
    );

    // One order for both vendors, never one order per vendor.
    expect(orderInputs).toHaveLength(1);
    expect(orderInputs[0].idempotentKey.value).toBe(id(12));
    expect(orderInputs[0].items).toHaveLength(2);
    expect(calls).toEqual(['create-order', 'save-cart', 'publish']);
    // Both lines left the cart once their single order was created.
    expect(savedItems).toEqual([0]);
    expect(published.map((event) => event.type)).toEqual(['cart.checked-out']);
    expect(result.updatedData).toMatchObject({
      order: { orderId: id(40), orderType: 'cart', vendorIds: [id(4), id(7)] },
    });
  });

  it('leaves the cart untouched when the order is rejected', async () => {
    const { service, calls, published, savedItems } = buildService({ orderFails: true });

    await expect(
      service.checkoutItems(
        { idempotentKey: id(12), addressId: id(11), waitingTime, cartItemIds: [id(30), id(31)] },
        actor,
      ),
    ).rejects.toThrow('insufficient_stock');

    // The order was never created, so the cart was never touched.
    expect(calls).toEqual(['create-order']);
    expect(savedItems).toEqual([]);
    expect(published).toHaveLength(0);
  });

  it('refuses a line that is no longer active in the cart', async () => {
    const { service, calls } = buildService();

    await expect(
      service.checkoutItems(
        { idempotentKey: id(12), addressId: id(11), waitingTime, cartItemIds: [id(99)] },
        actor,
      ),
    ).rejects.toThrow(`Cart item ${id(99)} not found.`);

    expect(calls).toEqual([]);
  });
});

describe('CartApplicationService cart provisioning', () => {
  it('returns null from GET while the cart has not been provisioned', async () => {
    const { service, calls } = buildService({ cart: null });

    expect(await service.getMyCart(actor)).toBeNull();
    expect(calls).toEqual([]);
  });

  it('init creates the permanent cart when the sign-in event was missed', async () => {
    const { service, calls, createdCarts } = buildService({ cart: null });

    const result = await service.initMyCart(actor);

    expect(calls).toEqual(['create-cart', 'publish']);
    expect(createdCarts).toHaveLength(1);
    expect(result.updatedData).toMatchObject({ buyerId: id(1), items: [] });
  });

  it('provisioning is idempotent, so every sign-in after the first is a no-op', async () => {
    const { service, calls, createdCarts } = buildService();

    await service.provisionForBuyer(Id.create(id(1)));

    expect(calls).toEqual([]);
    expect(createdCarts).toEqual([]);
  });
});

describe('CartApplicationService.deleteCart', () => {
  it('soft-deletes the cart with the admin reason and publishes the event', async () => {
    const { service, calls, published } = buildService();

    await service.deleteCart(id(20), { reason: 'cart created by spam bots' }, actor);

    expect(calls).toEqual(['save-cart', 'publish']);
    expect(published.map((event) => event.type)).toEqual(['cart.deleted']);
  });
});
