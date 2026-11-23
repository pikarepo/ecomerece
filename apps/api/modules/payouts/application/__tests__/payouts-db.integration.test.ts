import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { Id, Money, PaymentCapturedEvent } from '@ecomerece/domain';
import { LedgerEntryModel, PayoutModel } from '../../../payouts/infrastructure/payout.model';
import {
  createApiIntegrationHarness,
  integrationEnabled,
  type ApiIntegrationHarness,
  type OrderContext,
} from '../../../../testing/api-integration-harness';

process.env.PLATFORM_COMMISSION_RATE ||= '0.1';

let harness: ApiIntegrationHarness;

async function capturePayment(context: OrderContext, paymentId: string) {
  await harness.publish(
    new PaymentCapturedEvent({
      paymentId: Id.create(paymentId),
      orderId: Id.create(context.orderId),
      amount: Money.create(200),
      providerRef: 'integration_capture',
    }),
  );
  const entries = await LedgerEntryModel.find({ vendorId: context.vendorId }).lean();
  for (const entry of entries) harness.track(String(entry._id));
  return entries;
}

async function balance() {
  const data = harness.expectSuccess<{ balance: number }>(
    await harness.requestAs('vendor', '/payout/vendor/me/balance'),
  );
  return data.balance;
}

async function requestPayout(amount: number, destinationRef = 'integration-account') {
  const data = harness.expectSuccess<{ id: string; status: string }>(
    await harness.requestAs('vendor', '/payout/vendor/me', {
      method: 'POST',
      body: { amount, currency: 'USD', method: 'manual', destinationRef },
    }),
    201,
  );
  harness.track(data.id);
  return data;
}

async function tryRequestPayout(body: Record<string, unknown>) {
  const result = await harness.requestAs<{ id: string }>('vendor', '/payout/vendor/me', {
    method: 'POST',
    body,
  });
  if (result.body.success) harness.track(result.body.data.id);
  return result;
}

type PaymentCreated = { id: string; amount: number };

/** Captures through the real buyer payment routes, not through a published event. */
async function captureThroughApi(context: OrderContext, amount?: number) {
  const payment = harness.expectSuccess<PaymentCreated>(
    await harness.requestAs('buyer', '/payment/my', {
      method: 'POST',
      body: { orderId: context.orderId, currency: 'USD' },
    }),
    201,
  );
  harness.track(payment.id);
  harness.expectSuccess(
    await harness.requestAs('buyer', `/payment/my/${payment.id}/authorize`, { method: 'POST' }),
  );
  const captured = harness.expectSuccess<{ amount: number; capturedAmount: number }>(
    await harness.requestAs('buyer', `/payment/my/${payment.id}/capture`, {
      method: 'POST',
      body: { amount: amount ?? payment.amount },
    }),
  );
  return { payment, captured };
}

describe.skipIf(!integrationEnabled)('payout API database integration', () => {
  beforeAll(async () => {
    harness = await createApiIntegrationHarness({ dispatchEvents: true });
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

  it('records vendor ledger entries once for a captured payment', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    const paymentId = Id.create().value;

    const entries = await capturePayment(context, paymentId);
    expect(entries).toHaveLength(2);
    expect(entries.map((entry) => entry.type).sort()).toEqual(['commission_debit', 'sale_credit']);
    expect(await balance()).toBe(180);

    await capturePayment(context, paymentId);
    expect(await LedgerEntryModel.countDocuments({ vendorId: context.vendorId })).toBe(2);
    expect(await balance()).toBe(180);
  }, 30_000);

  it('debits available balance on payout request and keeps it debited when paid', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    await capturePayment(context, Id.create().value);

    const payout = await requestPayout(100);
    expect(payout.status).toBe('requested');
    expect(await balance()).toBe(80);

    harness.expectSuccess<{ status: string }>(
      await harness.requestAs('admin', `/payout/admin/${payout.id}/approve`, { method: 'POST' }),
    );
    const paid = harness.expectSuccess<{ status: string; providerRef: string | null }>(
      await harness.requestAs('admin', `/payout/admin/${payout.id}/mark-paid`, {
        method: 'POST',
        body: { providerRef: 'integration_payout' },
      }),
    );

    expect(paid.status).toBe('paid');
    expect(paid.providerRef).toBe('integration_payout');
    expect((await PayoutModel.findById(payout.id).lean())?.status).toBe('paid');
    expect(await balance()).toBe(80);
  }, 30_000);

  it('reverses the payout debit when an admin cancels the payout', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    await capturePayment(context, Id.create().value);

    const payout = await requestPayout(100);
    expect(await balance()).toBe(80);

    harness.expectSuccess<{ status: string }>(
      await harness.requestAs('admin', `/payout/admin/${payout.id}/cancel`, {
        method: 'POST',
        body: { reason: 'Cancelled by integration test.' },
      }),
    );

    expect((await PayoutModel.findById(payout.id).lean())?.status).toBe('cancelled');
    expect(await balance()).toBe(180);
  }, 30_000);

  /**
   * EXPLOIT ECON-08 — the balance check, payout creation and ledger debit are
   * three separate operations. Five simultaneous withdrawals all read the same
   * balance and all pass, so the vendor takes 5x its money and the ledger goes
   * negative. The assertion describes the safe behaviour; `.failing` records
   * that the code does not meet it yet and turns red the day it does.
   */
  it.failing('refuses concurrent withdrawals that together exceed the balance', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    await capturePayment(context, Id.create().value);
    const before = await balance();

    const attempts = 5;
    const results = await Promise.all(
      Array.from(
        { length: attempts },
        async (_, index) =>
          await harness.requestAs<{ id: string }>('vendor', '/payout/vendor/me', {
            method: 'POST',
            body: {
              amount: before,
              currency: 'USD',
              method: 'manual',
              destinationRef: `race-${index}`,
            },
          }),
      ),
    );

    const accepted = results.filter((result) => result.response.status === 201);
    for (const result of accepted) {
      if (result.body.success) harness.track(result.body.data.id);
    }

    const payoutRows = await PayoutModel.countDocuments({ vendorId: context.vendorId });
    const after = await balance();

    console.log(
      `[ECON-08] balanceBefore=${before} concurrentRequests=${attempts} accepted=${accepted.length} payoutRows=${payoutRows} statuses=${results.map((result) => result.response.status).join(',')} ledgerAfter=${after}`,
    );

    expect(
      accepted.length,
      'Every concurrent request passed the same balance check.',
    ).toBeLessThanOrEqual(1);
    expect(payoutRows, 'One balance must not produce several payout rows.').toBeLessThanOrEqual(1);
    expect(after, 'The vendor ledger must never go negative.').toBeGreaterThanOrEqual(0);
  }, 30_000);

  /**
   * EXPLOIT ECON-04 — a buyer captures 1 unit of a 200 order. The payout
   * handler credits the order item value instead of the captured amount, so the
   * vendor is credited 180 for a 1-unit payment and immediately withdraws it.
   */
  it.failing('credits only the captured amount so a 1-unit payment cannot be cashed out', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    const { payment, captured } = await captureThroughApi(context, 1);

    const credited = await balance();
    const withdrawal = await harness.requestAs<{ id: string }>('vendor', '/payout/vendor/me', {
      method: 'POST',
      body: {
        amount: credited,
        currency: 'USD',
        method: 'manual',
        destinationRef: 'underpay-cashout',
      },
    });
    if (withdrawal.body.success) harness.track(withdrawal.body.data.id);

    console.log(
      `[ECON-04] orderValue=${payment.amount} capturedAmount=${captured.capturedAmount} vendorCredit=${credited} withdrawalStatus=${withdrawal.response.status}`,
    );

    expect(credited, 'Credit must not exceed what the buyer actually paid.').toBeLessThanOrEqual(1);
    expect(withdrawal.response.status, 'An inflated credit must not be withdrawable.').toBe(400);
  }, 30_000);

  /**
   * CONTROL PROBE — the same attack as ECON-08 but sequential. This one is
   * expected to hold; if it ever fails, the balance guard is gone entirely.
   */
  it('refuses a second sequential withdrawal that would overdraw the balance', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    await capturePayment(context, Id.create().value);
    const before = await balance();

    await requestPayout(before, 'sequential-first');

    const second = await harness.requestAs<{ id: string }>('vendor', '/payout/vendor/me', {
      method: 'POST',
      body: {
        amount: 1,
        currency: 'USD',
        method: 'manual',
        destinationRef: 'sequential-second',
      },
    });

    console.log(
      `[ECON-08b] balanceBefore=${before} secondStatus=${second.response.status} ledgerAfter=${await balance()}`,
    );

    harness.expectError(second, 400);
    expect(await balance()).toBe(0);
  }, 30_000);

  it('ECON-09 blocks non-admin roles from every admin payout route', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    await capturePayment(context, Id.create().value);
    const payoutId = Id.create().value;
    const vendorRequests: Array<{ method: 'GET' | 'POST'; path: string }> = [
      { method: 'GET', path: '/payout/admin/all' },
      { method: 'GET', path: `/payout/admin/vendor/${context.vendorId}/balance` },
      { method: 'POST', path: `/payout/admin/${payoutId}/approve` },
      { method: 'POST', path: `/payout/admin/${payoutId}/mark-paid` },
      { method: 'POST', path: `/payout/admin/${payoutId}/fail` },
      { method: 'POST', path: `/payout/admin/${payoutId}/cancel` },
    ];
    const vendorStatuses: number[] = [];
    for (const request of vendorRequests) {
      vendorStatuses.push(
        (
          await harness.requestAs('vendor', request.path, {
            method: request.method,
            body: request.method === 'POST' ? {} : undefined,
          })
        ).response.status,
      );
    }
    const buyer = await harness.requestAs('buyer', '/payout/admin/all');
    const anonymous = await harness.requestWithToken('invalid-token', '/payout/admin/all');
    const admin = await harness.requestAs('admin', '/payout/admin/all');

    console.log(
      `[ECON-09] vendorStatuses=${vendorStatuses.join(',')} buyerStatus=${buyer.response.status} anonStatus=${anonymous.response.status}`,
    );

    for (const status of vendorStatuses) expect([401, 403]).toContain(status);
    expect([401, 403]).toContain(buyer.response.status);
    expect([401, 403]).toContain(anonymous.response.status);
    expect(admin.response.status).toBe(200);
  }, 30_000);

  it.failing('ECON-10 refuses to reverse the same payout more than once', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    await capturePayment(context, Id.create().value);
    const payout = await requestPayout(100, 'reversal-replay');
    const first = await harness.requestAs('admin', `/payout/admin/${payout.id}/cancel`, {
      method: 'POST',
      body: { reason: 'First cancellation.' },
    });
    const afterFirst = await balance();
    const second = await harness.requestAs('admin', `/payout/admin/${payout.id}/cancel`, {
      method: 'POST',
      body: { reason: 'Replayed cancellation.' },
    });
    const failAfterCancel = await harness.requestAs('admin', `/payout/admin/${payout.id}/fail`, {
      method: 'POST',
      body: { reason: 'Failure after cancellation.' },
    });
    const afterReplays = await balance();
    const row = await PayoutModel.findById(payout.id).lean();

    console.log(
      `[ECON-10] firstStatus=${first.response.status} secondStatus=${second.response.status} failStatus=${failAfterCancel.response.status} afterFirst=${afterFirst} afterReplays=${afterReplays} dbStatus=${row?.status}`,
    );

    expect(first.response.status).toBe(200);
    expect([400, 409, 422]).toContain(second.response.status);
    expect([400, 409, 422]).toContain(failAfterCancel.response.status);
    expect(afterReplays).toBe(afterFirst);
    expect(row?.status).toBe('cancelled');
  }, 30_000);

  it('ECON-11 rejects abusive payout requests without mutating the ledger', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    await capturePayment(context, Id.create().value);
    const before = await balance();
    const attempts = await Promise.all([
      tryRequestPayout({ amount: -1 }),
      tryRequestPayout({ amount: 0 }),
      tryRequestPayout({ amount: 'not-a-number' }),
      tryRequestPayout({ amount: 100, currency: 'US' }),
      tryRequestPayout({ amount: 100, method: 'x' }),
      tryRequestPayout({ amount: 100, destinationRef: 'x'.repeat(121) }),
    ]);
    const mass = await tryRequestPayout({
      amount: 100,
      currency: 'USD',
      method: 'manual',
      destinationRef: 'mass-assignment',
      vendorId: Id.create().value,
      status: 'paid',
      amountPaid: 999999,
    });
    const rows = await PayoutModel.find({ vendorId: context.vendorId }).lean();
    const after = await balance();

    console.log(
      `[ECON-11] statuses=${[...attempts, mass].map((result) => result.response.status).join(',')} before=${before} after=${after} rows=${rows.length} stored=${JSON.stringify(rows.map((row) => ({ status: row.status, amount: row.amount, vendorId: row.vendorId, ref: row.destinationRef })))}`,
    );

    for (const attempt of attempts) harness.expectError(attempt, 400);
    expect(mass.response.status).toBe(201);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.status).toBe('requested');
    expect(rows[0]?.amount).toBe(100);
    expect(rows[0]?.vendorId.toString()).toBe(context.vendorId);
    expect(rows[0]?.destinationRef).toBe('mass-assignment');
    expect(after).toBe(before - 100);
  }, 30_000);
});
