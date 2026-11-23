import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { PaymentModel } from '../../infrastructure/payment.model';
import {
  createApiIntegrationHarness,
  integrationEnabled,
  registerIntegrationIdentity,
  type ApiIntegrationHarness,
} from '../../../../testing/api-integration-harness';

const buyerAlt = {
  token: 'exploit-payments-buyer-alt-token',
  id: Id.create().value,
  email: 'payments-buyer-alt@example.com',
  fullName: 'Payments Buyer Alt',
};
registerIntegrationIdentity(buyerAlt);

let harness: ApiIntegrationHarness;

const createPayment = async (orderId: string) =>
  await harness.requestAs<{ id: string; amount: number }>('buyer', '/payment/my', {
    method: 'POST',
    body: { orderId, provider: 'manual', currency: 'USD' },
  });

const authorise = async (paymentId: string) =>
  await harness.requestAs('buyer', `/payment/my/${paymentId}/authorize`, { method: 'POST' });

const capture = async (paymentId: string, amount: number) =>
  await harness.requestAs('buyer', `/payment/my/${paymentId}/capture`, {
    method: 'POST',
    body: { amount },
  });

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

  it('refuses a capture above the authorised amount', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    const created = harness.expectSuccess<{ id: string }>(await createPayment(context.orderId), 201);
    const paymentId = harness.track(created.id);
    harness.expectSuccess(await authorise(paymentId));

    const over = await capture(paymentId, 201);
    harness.expectError(over, 400);

    const payment = await PaymentModel.findById(paymentId).lean();
    expect(payment?.capturedAmount).toBe(0);
    expect(payment?.status).not.toBe('captured');
  }, 30_000);

  it('refuses a capture of zero or a negative amount', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    const created = harness.expectSuccess<{ id: string }>(await createPayment(context.orderId), 201);
    const paymentId = harness.track(created.id);
    harness.expectSuccess(await authorise(paymentId));

    harness.expectError(await capture(paymentId, 0), 400);
    harness.expectError(await capture(paymentId, -200), 400);

    const payment = await PaymentModel.findById(paymentId).lean();
    expect(payment?.capturedAmount).toBe(0);
  }, 30_000);

  it('refuses a second capture of the same payment', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    const created = harness.expectSuccess<{ id: string }>(await createPayment(context.orderId), 201);
    const paymentId = harness.track(created.id);
    harness.expectSuccess(await authorise(paymentId));
    harness.expectSuccess(await capture(paymentId, 200));

    harness.expectError(await capture(paymentId, 200), 400);

    const payment = await PaymentModel.findById(paymentId).lean();
    expect(payment?.capturedAmount).toBe(200);
  }, 30_000);

  it('refuses refunds that together exceed the captured amount', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    const created = harness.expectSuccess<{ id: string }>(await createPayment(context.orderId), 201);
    const paymentId = harness.track(created.id);
    harness.expectSuccess(await authorise(paymentId));
    harness.expectSuccess(await capture(paymentId, 200));

    harness.expectError(
      await harness.requestAs('admin', `/payment/admin/${paymentId}/refund`, {
        method: 'POST',
        body: { amount: 201, reason: 'Refund above capture.' },
      }),
      400,
    );

    harness.expectSuccess(
      await harness.requestAs('admin', `/payment/admin/${paymentId}/refund`, {
        method: 'POST',
        body: { amount: 150, reason: 'Partial refund.' },
      }),
    );
    harness.expectError(
      await harness.requestAs('admin', `/payment/admin/${paymentId}/refund`, {
        method: 'POST',
        body: { amount: 150, reason: 'Second refund over the cap.' },
      }),
      400,
    );

    const payment = await PaymentModel.findById(paymentId).lean();
    expect(payment?.refundedAmount).toBe(150);
  }, 30_000);

  it('stops a second buyer from reading, capturing or refunding a payment', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    const created = harness.expectSuccess<{ id: string }>(await createPayment(context.orderId), 201);
    const paymentId = harness.track(created.id);
    harness.expectSuccess(await authorise(paymentId));

    const read = await harness.requestWithToken<unknown>(buyerAlt.token, `/payment/my/${paymentId}`);
    harness.expectError(read, 403);
    expect(JSON.stringify(read.body)).not.toContain(context.orderId);

    const steal = await harness.requestWithToken<unknown>(
      buyerAlt.token,
      `/payment/my/${paymentId}/capture`,
      { method: 'POST', body: { amount: 200 } },
    );
    harness.expectError(steal, 403);

    const refund = await harness.requestWithToken<unknown>(
      buyerAlt.token,
      `/payment/admin/${paymentId}/refund`,
      { method: 'POST', body: { amount: 200, reason: 'Self service refund.' } },
    );
    harness.expectError(refund, 403);

    const payment = await PaymentModel.findById(paymentId).lean();
    expect(payment?.capturedAmount).toBe(0);
    expect(payment?.refundedAmount).toBe(0);
  }, 30_000);

  /**
   * EXPLOIT ECON-04 (root cause) — the capture route accepts any amount between
   * 0 and the authorised total. The payout ledger credits the order value, not
   * this number, so a 1-unit capture on a 200 order credits 200. Until the
   * ledger is proportional, a partial capture must be refused.
   */
  it.failing('refuses a partial capture that the ledger cannot account for', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    const created = harness.expectSuccess<{ id: string; amount: number }>(
      await createPayment(context.orderId),
      201,
    );
    const paymentId = harness.track(created.id);
    harness.expectSuccess(await authorise(paymentId));

    const partial = await capture(paymentId, 1);
    const payment = await PaymentModel.findById(paymentId).lean();

    console.log(
      `[ECON-04-root] authorised=${created.amount} captureRequested=1 status=${partial.response.status} storedCaptured=${payment?.capturedAmount} paymentStatus=${payment?.status}`,
    );

    expect(
      partial.response.status,
      'A partial capture is accepted while the ledger still credits the full order.',
    ).toBe(400);
    expect(payment?.capturedAmount).toBe(0);
  }, 30_000);

  /**
   * EXPLOIT PAY-06 — the provider callback is unauthenticated by design, so the
   * only defence is the gateway's signature check. Fire a forged captured-event
   * at the manual provider and prove it cannot change payment state.
   */
  it('ignores a forged provider webhook', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    const created = harness.expectSuccess<{ id: string }>(await createPayment(context.orderId), 201);
    const paymentId = harness.track(created.id);

    const forged = await harness.requestAs<unknown>('buyer', '/payment/webhook/manual', {
      method: 'POST',
      body: {
        event: 'payment.captured',
        providerRef: paymentId,
        orderId: context.orderId,
        amount: 200,
      },
      headers: { 'x-provider-signature': 'forged' },
    });

    const payment = await PaymentModel.findById(paymentId).lean();
    console.log(
      `[PAY-06] webhookStatus=${forged.response.status} paymentStatus=${payment?.status} captured=${payment?.capturedAmount}`,
    );

    expect(payment?.status).toBe('pending');
    expect(payment?.capturedAmount).toBe(0);
  }, 30_000);
});
