import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { InventoryModel } from '../../../inventory/infrastructure/inventory.model';
import { OrderModel } from '../../../order/infrastructure/order.model';
import { ReturnModel } from '../../infrastructure/return.model';
import {
  integrationEnabled,
  type ApiData,
  type ApiIntegrationHarness,
  type OrderContext,
} from '../../../../testing/api-integration-harness';
import {
  createSecurityKit,
  expectRejected,
  type AttackResult,
  type SecurityKit,
} from '../../../../testing/security-kit';

let kit: SecurityKit;
let harness: ApiIntegrationHarness;

async function seedCompletedReturn() {
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
  const created = harness.expectSuccess<ApiData>(
    await harness.requestAs('buyer', '/return/my', {
      method: 'POST',
      body: {
        orderId: context.orderId,
        orderItemId: context.itemId,
        quantity: 1,
        returnType: 'refund',
        reason: 'Item arrived damaged.',
      },
    }),
    201,
  );
  const returnId = harness.track(harness.idFromData(created));
  return { ...context, returnId };
}

describe.skipIf(!integrationEnabled)('returns API database integration', () => {
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

  it('creates a requested return from a completed order item', async () => {
    const context: OrderContext & { returnId: string } = await seedCompletedReturn();
    harness.events.length = 0;

    const returnDoc = await ReturnModel.findById(context.returnId).lean();
    expect(returnDoc?.orderId).toBe(context.orderId);
    expect(returnDoc?.orderItemId).toBe(context.itemId);
    expect(returnDoc?.vendorId).toBe(context.vendorId);
    expect(returnDoc?.buyerId).toBe(harness.userIds.buyer);
    expect(returnDoc?.quantity).toBe(1);
    expect(returnDoc?.returnType).toBe('refund');
    expect(returnDoc?.status).toBe('requested');
    expect(returnDoc?.deleted.deleted).toBe(false);
  }, 30_000);

  it('approves a return and persists shipment and receipt transitions', async () => {
    const context = await seedCompletedReturn();
    harness.events.length = 0;

    harness.expectSuccess(
      await harness.requestAs('vendor', `/return/vendor/${context.returnId}/approve`, {
        method: 'POST',
        body: { reason: 'Approved for replacement.' },
      }),
    );
    expect((await ReturnModel.findById(context.returnId).lean())?.status).toBe('approved');
    expect(harness.events).toContain('return.approved');

    harness.events.length = 0;
    harness.expectSuccess(
      await harness.requestAs('vendor', `/return/vendor/${context.returnId}/shipped-back`, {
        method: 'POST',
      }),
    );
    harness.expectSuccess(
      await harness.requestAs('vendor', `/return/vendor/${context.returnId}/received`, {
        method: 'POST',
      }),
    );

    expect((await ReturnModel.findById(context.returnId).lean())?.status).toBe('received');
    expect(harness.events).toContain('return.shipped-back');
    expect(harness.events).toContain('return.received');
  }, 30_000);

  // ------------------------------------------------------------- exploit set

  const returnBody = (context: { orderId: string; itemId: string }, quantity: number) => ({
    orderId: context.orderId,
    orderItemId: context.itemId,
    quantity,
    returnType: 'refund',
    reason: 'Exploit return payload.',
  });

  /**
   * FINDING RET-01 — a received return touches nothing but its own status row.
   * The goods are never put back on the shelf and the buyer is never refunded:
   * `return.received` has a notification subscriber and no financial or
   * inventory subscriber at all.
   */
  it.failing('restocks goods and refunds money when a return is received', async () => {
    const context = await seedCompletedReturn();
    const inventoryBefore = await InventoryModel.findById(context.inventoryId).lean();

    harness.expectSuccess(
      await harness.requestAs('vendor', `/return/vendor/${context.returnId}/approve`, {
        method: 'POST',
        body: { reason: 'Approved.' },
      }),
    );
    harness.expectSuccess(
      await harness.requestAs('vendor', `/return/vendor/${context.returnId}/shipped-back`, {
        method: 'POST',
      }),
    );
    harness.expectSuccess(
      await harness.requestAs('vendor', `/return/vendor/${context.returnId}/received`, {
        method: 'POST',
      }),
    );

    const inventoryAfter = await InventoryModel.findById(context.inventoryId).lean();
    const order = await OrderModel.findById(context.orderId).lean();

    kit.evidence('RET-01', {
      returnStatus: (await ReturnModel.findById(context.returnId).lean())?.status,
      availableBefore: inventoryBefore?.available,
      availableAfter: inventoryAfter?.available,
      soldOutBefore: inventoryBefore?.soldOut,
      soldOutAfter: inventoryAfter?.soldOut,
      orderStatus: order?.status,
      published: harness.events.join(','),
    });

    expect(inventoryAfter?.available, 'Returned goods never came back on the shelf.').toBe(
      (inventoryBefore?.available ?? 0) + 1,
    );
    expect(order?.status, 'The order was never marked returned.').toBe('returned');
  }, 60_000);

  /**
   * FINDING RET-02 — the pending-quantity guard is a read followed by an
   * insert with no lock or transaction, so two simultaneous return requests
   * both pass it: two units are returnable for one unit bought.
   */
  it.failing('does not accept two returns for more units than were bought', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 1 });
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

    const results: AttackResult[] = await Promise.all([
      kit.send('buyer', '/return/my', { method: 'POST', body: returnBody(context, 1) }),
      kit.send('buyer', '/return/my', { method: 'POST', body: returnBody(context, 1) }),
    ]);
    const rows = await ReturnModel.find({ orderItemId: context.itemId }).lean();
    for (const row of rows) harness.track(row._id.toString());
    const requested = rows.reduce((sum, row) => sum + Number(row.quantity), 0);

    kit.evidence('RET-02', {
      statuses: kit.statuses(results),
      rows: rows.length,
      unitsRequested: requested,
      unitsBought: 1,
    });

    expect(requested, 'Two returns were accepted for a single purchased unit.').toBeLessThanOrEqual(1);
  }, 60_000);

  it('rejects zero, negative and fractional return quantities', async () => {
    const context = await seedCompletedReturn();
    const statuses: number[] = [];

    for (const quantity of [0, -1, 1.5]) {
      const result = await kit.send('buyer', '/return/my', {
        method: 'POST',
        body: returnBody(context, quantity),
      });
      statuses.push(result.status);
      const body = result.body as { data?: { updatedData?: { _id?: string } } };
      if (body.data?.updatedData?._id !== undefined) harness.track(body.data.updatedData._id);
    }

    const stored = await ReturnModel.findById(context.returnId).lean();
    kit.evidence('RET-03', { quantities: '0,-1,1.5', statuses: statuses.join(',') });

    expect(statuses.every((status) => status === 400)).toBe(true);
    expect(stored?.quantity).toBe(1);
  }, 60_000);

  it('refuses a return for another buyer order item', async () => {
    const context = await seedCompletedReturn();

    const foreign = await kit.send('buyerAlt', '/return/my', {
      method: 'POST',
      body: returnBody(context, 1),
    });
    const body = foreign.body as { data?: { updatedData?: { _id?: string } } };
    if (body.data?.updatedData?._id !== undefined) harness.track(body.data.updatedData._id);

    kit.evidence('RET-04', {
      foreignStatus: foreign.status,
      rowsForAlt: await ReturnModel.countDocuments({
        orderItemId: context.itemId,
        buyerId: { $ne: harness.userIds.buyer },
      }),
    });

    expectRejected(foreign, 'Foreign buyer return request');
  }, 60_000);

  it('refuses a return for an invented order item', async () => {
    const context = await seedCompletedReturn();

    const invented = await kit.send('buyer', '/return/my', {
      method: 'POST',
      body: {
        orderId: context.orderId,
        orderItemId: '01a2089f-1ef2-77a8-bb0c-8d8ff36dd156',
        quantity: 1,
        returnType: 'refund',
        reason: 'Invented order item id.',
      },
    });

    kit.evidence('RET-05', {
      inventedStatus: invented.status,
      rows: await ReturnModel.countDocuments({ orderItemId: '01a2089f-1ef2-77a8-bb0c-8d8ff36dd156' }),
    });

    expect(invented.status).toBeGreaterThanOrEqual(400);
    expect(invented.status).toBeLessThan(500);
  }, 60_000);

  it('refuses approving an already approved return', async () => {
    const context = await seedCompletedReturn();

    harness.expectSuccess(
      await harness.requestAs('vendor', `/return/vendor/${context.returnId}/approve`, {
        method: 'POST',
        body: { reason: 'First approval.' },
      }),
    );
    const again = await kit.send('vendor', `/return/vendor/${context.returnId}/approve`, {
      method: 'POST',
      body: { reason: 'Second approval.' },
    });

    kit.evidence('RET-06', {
      secondApproveStatus: again.status,
      status: (await ReturnModel.findById(context.returnId).lean())?.status,
    });

    expectRejected(again, 'Second approval');
  }, 60_000);

  it('refuses cancelling a received return', async () => {
    const context = await seedCompletedReturn();

    for (const action of ['approve', 'shipped-back', 'received']) {
      harness.expectSuccess(
        await harness.requestAs('vendor', `/return/vendor/${context.returnId}/${action}`, {
          method: 'POST',
          body: action === 'approve' ? { reason: 'Approve for receipt.' } : undefined,
        }),
      );
    }

    const cancel = await kit.send('buyer', `/return/my/${context.returnId}/cancel`, {
      method: 'POST',
      body: { reason: 'Cancel a received return.' },
    });

    kit.evidence('RET-07', {
      cancelStatus: cancel.status,
      status: (await ReturnModel.findById(context.returnId).lean())?.status,
    });

    expectRejected(cancel, 'Cancelling a received return');
    expect((await ReturnModel.findById(context.returnId).lean())?.status).toBe('received');
  }, 60_000);
});
