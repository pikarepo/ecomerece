import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { InventoryModel } from '../../../inventory/infrastructure/inventory.model';
import { OrderItemsModel } from '../../infrastructure/order-item.model';
import {
  integrationEnabled,
  type ApiIntegrationHarness,
} from '../../../../testing/api-integration-harness';
import {
  createSecurityKit,
  expectRejected,
  type AttackResult,
  type SecurityKit,
} from '../../../../testing/security-kit';

let kit: SecurityKit;
let harness: ApiIntegrationHarness;

describe.skipIf(!integrationEnabled)('order-items API database integration', () => {
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

  it('moves reserved stock to sold-out on vendor confirmation and keeps it on completion', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    harness.events.length = 0;

    harness.expectSuccess(
      await harness.requestAs('vendor', `/order-items/vendor/${context.itemId}/confirm`, {
        method: 'POST',
      }),
    );

    expect((await OrderItemsModel.findById(context.itemId).lean())?.status).toBe('confirmed');
    const confirmedInventory = await InventoryModel.findById(context.inventoryId).lean();
    expect(confirmedInventory?.reserved).toBe(0);
    expect(confirmedInventory?.soldOut).toBe(2);
    expect(harness.events).toContain('order-item.confirmed');

    harness.events.length = 0;
    harness.expectSuccess(
      await harness.requestAs('vendor', `/order-items/vendor/${context.itemId}/complete`, {
        method: 'POST',
      }),
    );

    expect((await OrderItemsModel.findById(context.itemId).lean())?.status).toBe('completed');
    const completedInventory = await InventoryModel.findById(context.inventoryId).lean();
    expect(completedInventory?.reserved).toBe(0);
    expect(completedInventory?.soldOut).toBe(2);
    expect(completedInventory?.available).toBe(8);
    expect(harness.events).toContain('order-item.completed');
  }, 30_000);

  it('returns stock once when an item is returned and then refunded', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    harness.expectSuccess(
      await harness.requestAs('vendor', `/order-items/vendor/${context.itemId}/confirm`, {
        method: 'POST',
      }),
    );
    harness.events.length = 0;

    harness.expectSuccess(
      await harness.requestAs('vendor', `/order-items/vendor/${context.itemId}/return`, {
        method: 'POST',
      }),
    );

    expect((await OrderItemsModel.findById(context.itemId).lean())?.status).toBe('returned');
    const returnedInventory = await InventoryModel.findById(context.inventoryId).lean();
    expect(returnedInventory?.available).toBe(10);
    expect(returnedInventory?.soldOut).toBe(0);
    expect(harness.events).toContain('order-item.returned');

    harness.events.length = 0;
    harness.expectSuccess(
      await harness.requestAs('vendor', `/order-items/vendor/${context.itemId}/refund`, {
        method: 'POST',
      }),
    );

    expect((await OrderItemsModel.findById(context.itemId).lean())?.status).toBe('refunded');
    const refundedInventory = await InventoryModel.findById(context.inventoryId).lean();
    expect(refundedInventory?.available).toBe(10);
    expect(refundedInventory?.soldOut).toBe(0);
    expect(harness.events).toContain('order-item.refunded');
  }, 30_000);

  it('releases reserved stock when the buyer cancels a pending item', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    harness.events.length = 0;

    harness.expectSuccess(
      await harness.requestAs('buyer', '/order-items/my/cancel', {
        method: 'POST',
        body: { orderId: context.orderId, itemIds: [context.itemId] },
      }),
    );

    expect((await OrderItemsModel.findById(context.itemId).lean())?.status).toBe('cancelled');
    const inventory = await InventoryModel.findById(context.inventoryId).lean();
    expect(inventory?.available).toBe(10);
    expect(inventory?.reserved).toBe(0);
    expect(inventory?.soldOut).toBe(0);
    expect(harness.events).toContain('order-item.cancelled');
  }, 30_000);

  // ------------------------------------------------------------- exploit set

  const updateBody = (price: number, quantity = 1) => ({
    quantity,
    price,
    waitingTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  });

  /**
   * FINDING OIT-01 — `OrderItemsAggregate.update` has no status guard. A
   * vendor can rewrite the price and quantity of a completed line, so the
   * historical record of what the buyer bought no longer matches what was
   * paid, returned or refunded.
   */
  it.failing('refuses rewriting the price of a completed line', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    harness.expectSuccess(
      await harness.requestAs('vendor', `/order-items/vendor/${context.itemId}/confirm`, {
        method: 'POST',
      }),
    );
    harness.expectSuccess(
      await harness.requestAs('vendor', `/order-items/vendor/${context.itemId}/complete`, {
        method: 'POST',
      }),
    );
    const before = await OrderItemsModel.findById(context.itemId).lean();

    const rewrite: AttackResult = await kit.send(
      'vendor',
      `/order-items/vendor/${context.itemId}`,
      { method: 'PATCH', body: updateBody(1000, 5) },
    );
    const after = await OrderItemsModel.findById(context.itemId).lean();
    const inventory = await InventoryModel.findById(context.inventoryId).lean();

    kit.evidence('OIT-01', {
      status: rewrite.status,
      statusAfter: after?.status,
      priceBefore: before?.price,
      priceAfter: after?.price,
      quantityBefore: before?.quantity,
      quantityAfter: after?.quantity,
      totalAfter: after?.totalPrice,
      soldOut: inventory?.soldOut,
    });

    expect(rewrite.status, 'A completed line accepted a new price.').toBe(400);
    expect(after?.price).toBe(before?.price);
    expect(after?.quantity).toBe(before?.quantity);
  }, 30_000);

  /**
   * FINDING OIT-02 — the same missing integer rule as ORD-02: quantity 1.5 is
   * accepted on a line update, so a single line can claim half a unit while the
   * inventory counters only move in whole units.
   */
  it.failing('refuses negative, zero and fractional prices and quantities on update', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    const statuses: number[] = [];

    for (const body of [updateBody(-1), updateBody(0), updateBody(10, 0), updateBody(10, 1.5)]) {
      const result = await kit.send('vendor', `/order-items/vendor/${context.itemId}`, {
        method: 'PATCH',
        body,
      });
      statuses.push(result.status);
    }

    const stored = await OrderItemsModel.findById(context.itemId).lean();
    kit.evidence('OIT-02', {
      statuses: statuses.join(','),
      storedPrice: stored?.price,
      storedQuantity: stored?.quantity,
    });

    expect(statuses.every((status) => status === 400), 'An invalid line update was accepted.').toBe(
      true,
    );
    expect(stored?.price).toBe(100);
    expect(stored?.quantity).toBe(2);
  }, 30_000);

  it('refuses a foreign vendor confirming or rewriting the line', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    await kit.vendorProfileFor('vendorAlt');

    const confirm = await kit.send(
      'vendorAlt',
      `/order-items/vendor/${context.itemId}/confirm`,
      { method: 'POST' },
    );
    const rewrite = await kit.send('vendorAlt', `/order-items/vendor/${context.itemId}`, {
      method: 'PATCH',
      body: updateBody(1, 1),
    });
    const read = await kit.send('vendorAlt', `/order-items/vendor/${context.itemId}`);

    kit.evidence('OIT-03', {
      confirmStatus: confirm.status,
      rewriteStatus: rewrite.status,
      readStatus: read.status,
      statusAfter: (await OrderItemsModel.findById(context.itemId).lean())?.status,
    });

    expectRejected(confirm, 'Foreign vendor item confirmation');
    expectRejected(rewrite, 'Foreign vendor item rewrite');
    expectRejected(read, 'Foreign vendor item read');
  }, 30_000);

  it('refuses refunding a pending line and refunding it twice', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });

    const earlyRefund = await kit.send('vendor', `/order-items/vendor/${context.itemId}/refund`, {
      method: 'POST',
    });

    harness.expectSuccess(
      await harness.requestAs('vendor', `/order-items/vendor/${context.itemId}/confirm`, {
        method: 'POST',
      }),
    );
    harness.expectSuccess(
      await harness.requestAs('vendor', `/order-items/vendor/${context.itemId}/complete`, {
        method: 'POST',
      }),
    );
    harness.expectSuccess(
      await harness.requestAs('vendor', `/order-items/vendor/${context.itemId}/refund`, {
        method: 'POST',
      }),
    );
    const doubleRefund = await kit.send('vendor', `/order-items/vendor/${context.itemId}/refund`, {
      method: 'POST',
    });

    const inventory = await InventoryModel.findById(context.inventoryId).lean();
    kit.evidence('OIT-04', {
      earlyRefundStatus: earlyRefund.status,
      doubleRefundStatus: doubleRefund.status,
      status: (await OrderItemsModel.findById(context.itemId).lean())?.status,
      available: inventory?.available,
      soldOut: inventory?.soldOut,
    });

    expectRejected(earlyRefund, 'Refunding a pending line');
    expectRejected(doubleRefund, 'Refunding twice');
    expect(inventory?.available).toBe(10);
    expect(inventory?.soldOut).toBe(0);
  }, 60_000);

  it('refuses a buyer cancelling a line of another buyer order', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });

    const foreign = await kit.send('buyerAlt', '/order-items/my/cancel', {
      method: 'POST',
      body: { orderId: context.orderId, itemIds: [context.itemId] },
    });
    const inventory = await InventoryModel.findById(context.inventoryId).lean();

    kit.evidence('OIT-05', {
      foreignCancelStatus: foreign.status,
      status: (await OrderItemsModel.findById(context.itemId).lean())?.status,
      available: inventory?.available,
    });

    expectRejected(foreign, 'Foreign buyer item cancellation');
    expect((await OrderItemsModel.findById(context.itemId).lean())?.status).toBe('pending');
    expect(inventory?.available).toBe(8);
  }, 30_000);
});
