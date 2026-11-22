import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { PaymentModel } from '../../infrastructure/payment.model';
import {
  createApiIntegrationHarness,
  integrationEnabled,
  type ApiIntegrationHarness,
} from '../../../../testing/api-integration-harness';

let harness: ApiIntegrationHarness;

describe.skipIf(!integrationEnabled)('payments API database integration', () => {
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

  it('creates a pending payment from an order with the correct amount', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    harness.events.length = 0;

    const created = harness.expectSuccess<{ id: string }>(
      await harness.requestAs('buyer', '/payment/my', {
        method: 'POST',
        body: { orderId: context.orderId, provider: 'manual', currency: 'USD' },
      }),
      201,
    );
    const paymentId = harness.track(created.id);

    const payment = await PaymentModel.findById(paymentId).lean();
    expect(payment?.orderId).toBe(context.orderId);
    expect(payment?.buyerId).toBe(harness.userIds.buyer);
    expect(payment?.amount).toBe(200);
    expect(payment?.capturedAmount).toBe(0);
    expect(payment?.refundedAmount).toBe(0);
    expect(payment?.status).toBe('pending');
    expect(harness.events).toContain('payment.created');
  }, 30_000);

  it('authorizes and captures a payment through the manual gateway', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    const created = harness.expectSuccess<{ id: string }>(
      await harness.requestAs('buyer', '/payment/my', {
        method: 'POST',
        body: { orderId: context.orderId, provider: 'manual', currency: 'USD' },
      }),
      201,
    );
    const paymentId = harness.track(created.id);
    harness.events.length = 0;

    harness.expectSuccess(
      await harness.requestAs('buyer', `/payment/my/${paymentId}/authorize`, { method: 'POST' }),
    );
    harness.expectSuccess(
      await harness.requestAs('buyer', `/payment/my/${paymentId}/capture`, {
        method: 'POST',
        body: { amount: 200 },
      }),
    );

    const payment = await PaymentModel.findById(paymentId).lean();
    expect(payment?.status).toBe('captured');
    expect(payment?.capturedAmount).toBe(200);
    expect(payment?.transactions.length).toBeGreaterThanOrEqual(2);
    expect(harness.events).toContain('payment.authorized');
    expect(harness.events).toContain('payment.captured');
  }, 30_000);
});
