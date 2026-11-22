import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { ReturnModel } from '../../infrastructure/return.model';
import {
  createApiIntegrationHarness,
  integrationEnabled,
  type ApiData,
  type ApiIntegrationHarness,
  type OrderContext,
} from '../../../../testing/api-integration-harness';

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
});
