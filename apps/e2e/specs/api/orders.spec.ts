import { randomUUID } from 'node:crypto';
import { expect, test } from '../../fixtures';
import { expectNoLeak, expectRejected } from '../../api/attack';
import { countDocuments, databaseConfigured } from '../../api/database';
import { expectOk } from '../../api/envelope';
import { type MessageData, requireRecordId, uniqueSuffix } from '../../api/identifiers';
import { ensureBuyerAddress } from '../../api/scenarios';
import { buildOrderWorkspace } from '../../api/world';

type CartLine = { id?: string; _id?: string; variantId?: string };

test.describe('orders', () => {
  test('reads an order with its items', async ({ admin, buyer, apiAs, cleanup, canAuthenticateAs }) => {
    test.skip(!(await canAuthenticateAs('vendor')), 'Requires a vendor access token.');

    const workspace = await buildOrderWorkspace({
      admin,
      vendor: await apiAs('vendor'),
      buyer,
      cleanup,
    });

    const order = await expectOk<{ id: string; totalPrice: number }>(
      await buyer.get(`/order/my/${workspace.orderId}`),
    );
    expect(order.id).toBe(workspace.orderId);
    expect(order.totalPrice).toBeGreaterThan(0);

    const items = await expectOk<CartLine[]>(
      await buyer.get(`/order-items/my/order/${workspace.orderId}`),
    );
    expect(items.length).toBeGreaterThan(0);
  });

  test('builds an order from the cart endpoint', async ({
    admin,
    buyer,
    apiAs,
    cleanup,
    canAuthenticateAs,
  }) => {
    test.skip(!(await canAuthenticateAs('vendor')), 'Requires a vendor access token.');

    const workspace = await buildOrderWorkspace({
      admin,
      vendor: await apiAs('vendor'),
      buyer,
      cleanup,
      available: 5,
    });

    const cart = await expectOk<{ id: string }>(await buyer.post('/cart/my'));
    await expectOk(
      await buyer.post('/cart/my/items', {
        data: { variantId: workspace.variantId, quantity: 2 },
      }),
    );
    const cartState = await expectOk<{ items?: CartLine[]; cartItems?: CartLine[] }>(
      await buyer.get('/cart/my'),
    );
    const lines = cartState.items ?? cartState.cartItems ?? [];
    const cartItemIds = lines
      .map((line) => line.id ?? line._id)
      .filter((id): id is string => id !== undefined);
    expect(cartItemIds.length, 'The cart must return its line ids for checkout.').toBeGreaterThan(0);

    const checkedOut = await buyer.post('/cart/my/checkout', {
      data: {
        idempotentKey: randomUUID(),
        addressId: workspace.addressId,
        waitingTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        cartItemIds,
      },
    });
    expect(checkedOut.status(), 'Cart checkout must not raise a server error.').toBeLessThan(500);

    if (databaseConfigured()) {
      await countDocuments('carts', { _id: cart.id });
    }
  });

  test('does not let a second buyer read or cancel an order', async ({
    admin,
    buyer,
    apiAs,
    cleanup,
    canAuthenticateAs,
  }) => {
    test.skip(!(await canAuthenticateAs('vendor')), 'Requires a vendor access token.');
    test.skip(!(await canAuthenticateAs('buyerAlt')), 'Requires E2E_API_TOKEN_BUYER_ALT.');

    const workspace = await buildOrderWorkspace({
      admin,
      vendor: await apiAs('vendor'),
      buyer,
      cleanup,
    });
    const attacker = await apiAs('buyerAlt');

    const read = await attacker.get(`/order/my/${workspace.orderId}`);
    await expectRejected(read, 'Cross-buyer order read');
    await expectNoLeak(read, [workspace.orderId], 'Cross-buyer order read');

    const cancel = await attacker.post(`/order/my/${workspace.orderId}/cancel`, {
      data: { reason: 'Cross-tenant cancellation attempt.' },
    });
    await expectRejected(cancel, 'Cross-buyer order cancel');

    const ownerView = await expectOk<{ totalPrice: number }>(
      await buyer.get(`/order/my/${workspace.orderId}`),
    );
    expect(ownerView.totalPrice).toBeGreaterThan(0);
  });

  test('scopes the buyer order list to the caller', async ({
    admin,
    buyer,
    apiAs,
    cleanup,
    canAuthenticateAs,
  }) => {
    test.skip(!(await canAuthenticateAs('vendor')), 'Requires a vendor access token.');
    test.skip(!(await canAuthenticateAs('buyerAlt')), 'Requires E2E_API_TOKEN_BUYER_ALT.');

    const workspace = await buildOrderWorkspace({
      admin,
      vendor: await apiAs('vendor'),
      buyer,
      cleanup,
    });
    const attacker = await apiAs('buyerAlt');
    const listing = await expectOk<{ data: Array<{ id: string }> }>(
      await attacker.get('/order/my?limit=20'),
    );

    expect(listing.data.map((order) => order.id)).not.toContain(workspace.orderId);
  });

  test('a repeated idempotency key does not duplicate the order', async ({
    admin,
    buyer,
    apiAs,
    cleanup,
    canAuthenticateAs,
  }) => {
    test.skip(!(await canAuthenticateAs('vendor')), 'Requires a vendor access token.');

    const workspace = await buildOrderWorkspace({
      admin,
      vendor: await apiAs('vendor'),
      buyer,
      cleanup,
      available: 5,
    });
    const addressId = await ensureBuyerAddress({ buyer, suffix: uniqueSuffix() });

    const idempotentKey = randomUUID();
    const body = {
      idempotentKey,
      addressId,
      safeOrder: true,
      waitingTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      items: [{ variantId: workspace.variantId, quantity: 1 }],
    };

    const first = await buyer.post('/order/my', { data: body });
    expect(first.status(), 'The initial order must be created.').toBeLessThan(400);

    const replay = await buyer.post('/order/my', { data: body });
    expect(replay.status(), 'A replayed checkout must never 5xx.').toBeLessThan(500);

    if (databaseConfigured()) {
      const duplicates = await countDocuments('orders', { idempotentKey });
      expect(duplicates, 'One idempotency key must produce exactly one order.').toBe(1);
    }
  });
});
