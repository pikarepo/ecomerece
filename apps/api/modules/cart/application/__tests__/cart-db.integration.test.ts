import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { CartModel } from '../../infrastructure/cart.model';
import { InventoryModel } from '../../../inventory/infrastructure/inventory.model';
import { OrderItemsModel } from '../../../order-items/infrastructure/order-item.model';
import { OrderModel } from '../../../order/infrastructure/order.model';
import { UserModel } from '../../../user/infrastructure/user.models';
import {
  integrationEnabled,
  type ApiIntegrationHarness,
  type ApiData,
} from '../../../../testing/api-integration-harness';
import {
  createSecurityKit,
  expectRejected,
  expectUnauthorized,
  type AttackResult,
  type SecurityKit,
  type Tenant,
} from '../../../../testing/security-kit';

let kit: SecurityKit;
let harness: ApiIntegrationHarness;

async function ensureCart(tenant: Tenant = 'buyer'): Promise<string> {
  const result = await kit.send(tenant, '/cart/my', { method: 'POST' });
  if (!result.accepted) throw new Error(`Cart provisioning failed: ${result.status}`);
  const cart = await CartModel.findOne({ buyerId: await ownerId(tenant) }).lean();
  if (!cart) throw new Error(`No cart row for ${tenant}.`);
  return harness.track(String(cart._id));
}

async function ownerId(tenant: Tenant): Promise<string> {
  if (tenant === 'buyerAlt' || tenant === 'vendorAlt') {
    const prefix = tenant === 'buyerAlt' ? 'sec-buyer-alt' : 'sec-vendor-alt';
    const user = await UserModel.findOne({ email: `${prefix}-${kit.runId}@example.com` }).lean();
    if (!user) throw new Error(`No integration user for ${tenant}.`);
    return String(user._id);
  }
  return harness.userIds[tenant === 'admin' ? 'admin' : tenant === 'vendor' ? 'vendor' : 'buyer'];
}

async function addItem(variantId: string, quantity: number, tenant: Tenant = 'buyer') {
  const result = await kit.send(tenant, '/cart/my/items', {
    method: 'POST',
    body: { variantId, quantity },
  });
  return result;
}

async function cartDoc(tenant: Tenant = 'buyer') {
  return await CartModel.findOne({
    buyerId: await ownerId(tenant),
    'deleted.deleted': false,
  }).lean();
}

function lineFor<T extends { variantId: string }>(cart: { items: T[] } | null, variantId: string) {
  return cart?.items.filter((item) => item.variantId === variantId) ?? [];
}

async function checkout(body: {
  idempotentKey: string;
  addressId: string;
  waitingTime: string;
  cartItemIds: string[];
}) {
  return await kit.send('buyer', '/cart/my/checkout', { method: 'POST', body });
}

function errorCode(result: AttackResult): string {
  const body = result.body as { error?: { code?: string } } | null;
  return body?.error?.code ?? 'unknown';
}

describe.skipIf(!integrationEnabled)('cart API database integration', () => {
  beforeAll(async () => {
    kit = await createSecurityKit();
    harness = kit.harness;
  }, 30_000);

  beforeEach(() => {
    harness.events.length = 0;
  });

  afterEach(async () => {
    await harness.cleanup();
  });

  afterAll(async () => {
    if (kit) await kit.dispose();
  });

  it('provisions one cart per buyer and keeps repeated initialization idempotent', async () => {
    // The signed-in event provisions a cart during harness boot; remove that row
    // so this case still exercises the initial provisioning path it asserts.
    const bootCart = await CartModel.findOne({ buyerId: harness.userIds.buyer }).lean();
    if (bootCart) await CartModel.deleteOne({ _id: bootCart._id });

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

  /** EXPLOIT CART-01 — neither the DTO nor Quantity requires an integer. */
  it.failing('keeps cart line quantities integral', async () => {
    const context = await harness.seedCatalog({ available: 10 });
    await ensureCart();
    expect(context.variantId.length).toBeGreaterThan(0);

    const result = await addItem(context.variantId, 1.5);
    const cart = await cartDoc();
    const lines = lineFor(cart, context.variantId);

    kit.evidence('CART-01', {
      status: result.status,
      storedQuantity: lines[0]?.quantity,
      lineCount: lines.length,
      variantId: context.variantId,
    });
    expectRejected(result, 'fractional cart quantity');
    expect(lines).toHaveLength(0);
  }, 30_000);

  it('CART-02 rejects zero, negative, string, null and array quantities with no row change', async () => {
    const context = await harness.seedCatalog({ available: 10 });
    await ensureCart();
    const before = (await cartDoc())?.items.length ?? 0;

    const zero = await addItem(context.variantId, 0);
    const negative = await addItem(context.variantId, -3);
    const asString = await kit.send('buyer', '/cart/my/items', {
      method: 'POST',
      body: { variantId: context.variantId, quantity: '2' },
    });
    const asNull = await kit.send('buyer', '/cart/my/items', {
      method: 'POST',
      body: { variantId: context.variantId, quantity: null },
    });
    const asArray = await kit.send('buyer', '/cart/my/items', {
      method: 'POST',
      body: { variantId: context.variantId, quantity: [2] },
    });

    const after = (await cartDoc())?.items.length ?? 0;
    kit.evidence('CART-02', {
      statuses: [zero.status, negative.status, asString.status, asNull.status, asArray.status].join(
        ',',
      ),
      codes: [errorCode(zero), errorCode(asString)].join(','),
      before,
      after,
    });
    for (const result of [zero, negative, asString, asNull, asArray]) {
      expectRejected(result, 'invalid cart quantity');
      expect(result.status).not.toBe(500);
    }
    expect(after).toBe(before);
  }, 30_000);

  it('CART-03 stores an absurd quantity without inflating stock on checkout', async () => {
    const context = await harness.seedCatalog({ available: 10 });
    await ensureCart();
    const added = await addItem(context.variantId, 1e9);
    const itemId = (await cartDoc())?.items[0]?._id;
    if (!itemId) throw new Error('Absurd-quantity line was not persisted.');
    const idempotentKey = Id.create().value;

    const checkoutResult = await checkout({
      idempotentKey,
      addressId: context.addressId,
      waitingTime: new Date(Date.now() + 60_000).toISOString(),
      cartItemIds: [itemId],
    });
    const inventory = await InventoryModel.findById(context.inventoryId).lean();

    kit.evidence('CART-03', {
      addStatus: added.status,
      storedQuantity: lineFor(await cartDoc(), context.variantId)[0]?.quantity,
      checkoutStatus: checkoutResult.status,
      available: inventory?.available,
      reserved: inventory?.reserved,
      orders: await OrderModel.countDocuments({ idempotentKey }),
    });
    expect(added.accepted).toBe(true);
    expectRejected(checkoutResult, 'checkout of an absurd quantity');
    expect(inventory?.available).toBe(10);
    expect(inventory?.reserved).toBe(0);
    expect(await OrderModel.countDocuments({ idempotentKey })).toBe(0);
  }, 30_000);

  it('CART-04 accepts an invented variant into a cart but cannot order it', async () => {
    const context = await harness.seedCatalog({ available: 10 });
    await ensureCart();
    const invented = Id.create().value;
    const added = await addItem(invented, 2);
    const itemId = String(lineFor(await cartDoc(), invented)[0]?._id ?? '');
    if (!itemId) throw new Error('Invented variant was not stored as a cart line.');
    const idempotentKey = Id.create().value;

    const result = await checkout({
      idempotentKey,
      addressId: context.addressId,
      waitingTime: new Date(Date.now() + 60_000).toISOString(),
      cartItemIds: [itemId],
    });

    kit.evidence('CART-04', {
      addStatus: added.status,
      checkoutStatus: result.status,
      checkoutCode: errorCode(result),
      orders: await OrderModel.countDocuments({ idempotentKey }),
      available: (await InventoryModel.findById(context.inventoryId).lean())?.available,
    });
    expect(added.accepted).toBe(true);
    expectRejected(result, 'checkout of an invented variant');
    expect(await OrderModel.countDocuments({ idempotentKey })).toBe(0);
  }, 30_000);

  it('CART-05 refuses a cross-tenant checkout using another buyer line id', async () => {
    const context = await harness.seedCatalog({ available: 10 });
    await ensureCart();
    await ensureCart('buyerAlt');
    await addItem(context.variantId, 1);
    const victimLine = (await cartDoc())?.items[0]?._id;
    if (!victimLine) throw new Error('Victim cart line missing.');
    const idempotentKey = Id.create().value;

    const stolen = await kit.send('buyerAlt', '/cart/my/checkout', {
      method: 'POST',
      body: {
        idempotentKey,
        addressId: context.addressId,
        waitingTime: new Date(Date.now() + 60_000).toISOString(),
        cartItemIds: [victimLine],
      },
    });

    kit.evidence('CART-05', {
      status: stolen.status,
      code: errorCode(stolen),
      victimLineCount: (await cartDoc())?.items.length,
      orders: await OrderModel.countDocuments({ idempotentKey }),
    });
    expectRejected(stolen, 'cross-tenant line selection');
    expect((await cartDoc())?.items).toHaveLength(1);
    expect(await OrderModel.countDocuments({ idempotentKey })).toBe(0);
  }, 30_000);

  it('CART-06 replays a checkout key without creating a second order or reservation', async () => {
    const context = await harness.seedCatalog({ available: 10 });
    await ensureCart();
    await addItem(context.variantId, 2);
    const itemId = (await cartDoc())?.items[0]?._id;
    if (!itemId) throw new Error('Cart line missing.');
    const idempotentKey = Id.create().value;
    const body = {
      idempotentKey,
      addressId: context.addressId,
      waitingTime: new Date(Date.now() + 60_000).toISOString(),
      cartItemIds: [itemId],
    };

    const first = await checkout(body);
    const repeat = await checkout(body);
    const inventory = await InventoryModel.findById(context.inventoryId).lean();

    kit.evidence('CART-06', {
      firstStatus: first.status,
      repeatStatus: repeat.status,
      orders: await OrderModel.countDocuments({ idempotentKey }),
      available: inventory?.available,
      reserved: inventory?.reserved,
      cartLines: (await cartDoc())?.items.length,
    });
    expect(first.accepted).toBe(true);
    expectRejected(repeat, 'checkout replay');
    expect(await OrderModel.countDocuments({ idempotentKey })).toBe(1);
    expect(inventory?.available).toBe(8);
    expect(inventory?.reserved).toBe(2);
  }, 30_000);

  it('CART-07 races the same variant and keeps one line with the accepted quantity', async () => {
    const context = await harness.seedCatalog({ available: 10 });
    await ensureCart();
    const attempts = 5;
    const results = await kit.race(attempts, async () => await addItem(context.variantId, 1));
    const lines = lineFor(await cartDoc(), context.variantId);
    const accepted = kit.accepted(results).length;

    kit.evidence('CART-07', {
      statuses: kit.statuses(results).join(','),
      accepted,
      lines: lines.length,
      quantity: lines[0]?.quantity,
    });
    expect(lines).toHaveLength(1);
    expect(lines[0]?.quantity).toBe(accepted);
    expect(results.every((result) => result.status < 500)).toBe(true);
  }, 60_000);

  /**
   * CONTROL CART-08 — the unique index on buyerId is the actual guard against
   * duplicate provisioning, so the losers must fail without creating a cart.
   */
  it('keeps one active cart when provisioning races after a soft delete', async () => {
    const cartId = await ensureCart();
    expect(cartId.length, 'fixture cart id must exist').toBeGreaterThan(0);
    const deleted = await kit.send('admin', `/cart/admin/${cartId}`, {
      method: 'DELETE',
      body: { reason: 'Security race on provisioning.' },
    });
    expect(deleted.accepted, 'admin soft-delete fixture must succeed').toBe(true);

    const attempts = 5;
    const results = await kit.race(
      attempts,
      async () => await kit.send('buyer', '/cart/my', { method: 'POST' }),
    );
    const allCarts = await CartModel.find({ buyerId: harness.userIds.buyer }).lean();
    for (const cart of allCarts) harness.track(String(cart._id));
    const active = allCarts.filter((cart) => !cart.deleted.deleted);

    kit.evidence('CART-08', {
      statuses: kit.statuses(results).join(','),
      accepted: kit.accepted(results).length,
      activeCarts: active.length,
      totalRows: allCarts.length,
    });
    expect(active.length, 'A buyer must have exactly one active cart.').toBeLessThanOrEqual(1);
    expect(
      results.every((result) => result.status < 500),
      'Losers must fail as client errors.',
    ).toBe(true);
  }, 60_000);

  it('CART-09 stops a foreign tenant from admin-deleting a cart', async () => {
    const cartId = await ensureCart();
    const foreign = await kit.send('buyerAlt', `/cart/admin/${cartId}`, {
      method: 'DELETE',
      body: { reason: 'Foreign tenant deletion attempt.' },
    });
    const doc = await CartModel.findById(cartId).lean();

    kit.evidence('CART-09', {
      status: foreign.status,
      deletedFlag: doc?.deleted.deleted,
      version: doc?.version,
    });
    expectUnauthorized(foreign, 'foreign cart deletion');
    expect(doc?.deleted.deleted).toBe(false);
  }, 30_000);

  it('CART-10 refuses checkout of a soft-deleted cart with no order or stock movement', async () => {
    const context = await harness.seedCatalog({ available: 10 });
    const cartId = await ensureCart();
    await addItem(context.variantId, 1);
    const itemId = (await CartModel.findById(cartId).lean())?.items[0]?._id;
    await kit.send('admin', `/cart/admin/${cartId}`, {
      method: 'DELETE',
      body: { reason: 'Checkout after deletion probe.' },
    });
    expect(itemId, 'deleted cart should retain its line').toBeDefined();
    const idempotentKey = Id.create().value;

    const result = await checkout({
      idempotentKey,
      addressId: context.addressId,
      waitingTime: new Date(Date.now() + 60_000).toISOString(),
      cartItemIds: [itemId ?? ''],
    });

    kit.evidence('CART-10', {
      status: result.status,
      code: errorCode(result),
      orders: await OrderModel.countDocuments({ idempotentKey }),
      available: (await InventoryModel.findById(context.inventoryId).lean())?.available,
    });
    expectRejected(result, 'checkout of deleted cart');
    expect(await OrderModel.countDocuments({ idempotentKey })).toBe(0);
    expect((await InventoryModel.findById(context.inventoryId).lean())?.available).toBe(10);
  }, 30_000);

  it('CART-11 rejects empty selection and malformed line ids before creating an order', async () => {
    const context = await harness.seedCatalog({ available: 10 });
    await ensureCart();
    await addItem(context.variantId, 1);
    const base = {
      idempotentKey: Id.create().value,
      addressId: context.addressId,
      waitingTime: new Date(Date.now() + 60_000).toISOString(),
    };

    const empty = await checkout({ ...base, cartItemIds: [] });
    const malformed = await checkout({ ...base, cartItemIds: ['not-a-uuid'] });
    const invented = await checkout({ ...base, cartItemIds: [Id.create().value] });

    kit.evidence('CART-11', {
      emptyStatus: empty.status,
      malformedStatus: malformed.status,
      inventedStatus: invented.status,
      orders: await OrderModel.countDocuments({ idempotentKey: base.idempotentKey }),
    });
    expectRejected(empty, 'empty checkout selection');
    expectRejected(malformed, 'malformed checkout line');
    expectRejected(invented, 'invented checkout line');
    expect(await OrderModel.countDocuments({ idempotentKey: base.idempotentKey })).toBe(0);
  }, 30_000);
});
