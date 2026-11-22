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

async function requestPayout(amount: number) {
  const data = harness.expectSuccess<{ id: string; status: string }>(
    await harness.requestAs('vendor', '/payout/vendor/me', {
      method: 'POST',
      body: { amount, currency: 'USD', method: 'manual', destinationRef: 'integration-account' },
    }),
    201,
  );
  harness.track(data.id);
  return data;
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
});
