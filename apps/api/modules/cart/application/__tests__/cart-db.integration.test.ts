import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { CartModel } from '../../infrastructure/cart.model';
import { InventoryModel } from '../../../inventory/infrastructure/inventory.model';
import { OrderItemsModel } from '../../../order-items/infrastructure/order-item.model';
import { OrderModel } from '../../../order/infrastructure/order.model';
import {
  createApiIntegrationHarness,
  integrationEnabled,
  type ApiIntegrationHarness,
  type ApiData,
} from '../../../../testing/api-integration-harness';

let harness: ApiIntegrationHarness;

describe.skipIf(!integrationEnabled)('cart API database integration', () => {
  beforeAll(async () => {
    harness = await createApiIntegrationHarness();
  }, 30_000);

  beforeEach(() => {
    harness.events.length = 0;
  });

  afterEach(async () => {
    await harness.cleanup();
  });

  afterAll(async () => {
    if (harness) await harness.close();
  });

  it('provisions one cart per buyer and keeps repeated initialization idempotent', async () => {
    const first = harness.expectSuccess<ApiData>(
      await harness.requestAs('buyer', '/cart/my', { method: 'POST' }),
    );
    const second = harness.expectSuccess<ApiData>(
      await harness.requestAs('buyer', '/cart/my', { method: 'POST' }),
    );

    const cart = await CartModel.findOne({ buyerId: harness.userIds.buyer }).lean();
    if (!cart) throw new Error('Cart provisioning did not persist a cart.');
    harness.track(String(cart._id));

    expect(first.message?.length).toBeGreaterThan(0);
    expect(second.message?.length).toBeGreaterThan(0);
    expect(await CartModel.countDocuments({ buyerId: harness.userIds.buyer })).toBe(1);
    expect(cart.version).toBe(0);
    expect(cart.items).toEqual([]);
    expect(harness.events.filter((event) => event === 'cart.created')).toHaveLength(1);
  });

  it('checks out selected items, creates an order, and removes only selected cart lines', async () => {
    const context = await harness.seedCatalog({ available: 10 });
    harness.expectSuccess<ApiData>(
      await harness.requestAs('buyer', '/cart/my', { method: 'POST' }),
    );
    harness.expectSuccess<ApiData>(
      await harness.requestAs('buyer', '/cart/my/items', {
        method: 'POST',
        body: { variantId: context.variantId, quantity: 2 },
      }),
    );

    const beforeCart = await CartModel.findOne({ buyerId: harness.userIds.buyer }).lean();
    const cartId = String(beforeCart?._id);
    harness.track(cartId);
    const itemId = String(beforeCart?.items[0]?._id);
    expect(itemId.length).toBeGreaterThan(0);

    const idempotentKey = Id.create().value;
    harness.events.length = 0;
    harness.expectSuccess<ApiData>(
      await harness.requestAs('buyer', '/cart/my/checkout', {
        method: 'POST',
        body: {
          idempotentKey,
          addressId: context.addressId,
          waitingTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          cartItemIds: [itemId],
        },
      }),
    );

    const order = await OrderModel.findOne({ idempotentKey }).lean();
    if (!order) throw new Error('Checkout did not persist an order.');
    const orderId = String(order._id);
    harness.track(orderId);
    harness.trackCleanup(() => OrderItemsModel.deleteMany({ orderId }));

    const items = await OrderItemsModel.find({ orderId }).lean();
    for (const item of items) harness.track(String(item._id));
    expect(items).toHaveLength(1);
    expect(items[0]?.variantId).toBe(context.variantId);
    expect(items[0]?.quantity).toBe(2);

    const afterCart = await CartModel.findById(cartId).lean();
    expect(afterCart?.items).toEqual([]);
    expect(afterCart?.version).toBe(2);

    const inventory = await InventoryModel.findById(context.inventoryId).lean();
    expect(inventory?.available).toBe(8);
    expect(inventory?.reserved).toBe(2);

    expect(harness.events).toContain('order.created');
    expect(harness.events).toContain('cart.checked-out');
  }, 30_000);

  it('keeps cart lines and stock unchanged when checkout order creation fails', async () => {
    const context = await harness.seedCatalog({ available: 1 });
    harness.expectSuccess<ApiData>(
      await harness.requestAs('buyer', '/cart/my', { method: 'POST' }),
    );
    harness.expectSuccess<ApiData>(
      await harness.requestAs('buyer', '/cart/my/items', {
        method: 'POST',
        body: { variantId: context.variantId, quantity: 2 },
      }),
    );

    const cart = await CartModel.findOne({ buyerId: harness.userIds.buyer }).lean();
    harness.track(String(cart?._id));
    const itemId = String(cart?.items[0]?._id);
    const idempotentKey = Id.create().value;
    harness.events.length = 0;

    const rejected = await harness.requestAs<ApiData>('buyer', '/cart/my/checkout', {
      method: 'POST',
      body: {
        idempotentKey,
        addressId: context.addressId,
        waitingTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        cartItemIds: [itemId],
      },
    });
    const error = harness.expectError(rejected, 400);
    expect(error.message.length).toBeGreaterThan(0);

    const afterCart = await CartModel.findOne({ buyerId: harness.userIds.buyer }).lean();
    expect(afterCart?.items).toHaveLength(1);
    expect(afterCart?.items[0]?._id).toBe(itemId);
    expect(await OrderModel.countDocuments({ idempotentKey })).toBe(0);

    const inventory = await InventoryModel.findById(context.inventoryId).lean();
    expect(inventory?.available).toBe(1);
    expect(inventory?.reserved).toBe(0);
    expect(harness.events).not.toContain('cart.checked-out');
  }, 30_000);
});
