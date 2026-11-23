import { expectAuthRejected, expectRejected } from '../../api/attack';
import { countDocuments, databaseConfigured } from '../../api/database';
import { expectOk } from '../../api/envelope';
import { acquireVendorLedgerLock, releaseVendorLedgerLock } from '../../api/lock';
import { buildPaidOrder } from '../../api/world';
import { expect, test } from '../../fixtures';

type PaymentView = { id: string; status: string; amount: number; capturedAmount: number };
type Balance = { balance: number };
type PayoutView = { id: string; status: string; amount: number };

test.describe('money', () => {
  test.describe.configure({ timeout: 180_000 });
  let lockHeld = false;

  test.beforeEach(async () => {
    await acquireVendorLedgerLock();
    lockHeld = true;
  });

  test.afterEach(async () => {
    if (!lockHeld) return;
    await releaseVendorLedgerLock();
    lockHeld = false;
  });

  test('captures a payment and credits the vendor balance', async ({
    admin,
    buyer,
    apiAs,
    cleanup,
    canAuthenticateAs,
  }) => {
    test.skip(!(await canAuthenticateAs('vendor')), 'Requires a vendor access token.');

    const vendor = await apiAs('vendor');
    const paid = await buildPaidOrder({ admin, vendor, buyer, cleanup });

    const payment = await expectOk<PaymentView>(await buyer.get(`/payment/my/${paid.paymentId}`));
    expect(payment.status).toBe('captured');
    expect(payment.capturedAmount).toBe(payment.amount);

    const balance = await expectOk<Balance>(await vendor.get('/payout/vendor/me/balance'));
    expect(balance.balance, 'A captured sale must credit the vendor.').toBeGreaterThan(0);
  });

  test('refuses a second capture of the same payment', async ({
    admin,
    buyer,
    apiAs,
    cleanup,
    canAuthenticateAs,
  }) => {
    test.skip(!(await canAuthenticateAs('vendor')), 'Requires a vendor access token.');

    const paid = await buildPaidOrder({ admin, buyer, vendor: await apiAs('vendor'), cleanup });

    const replay = await buyer.post(`/payment/my/${paid.paymentId}/capture`, {
      data: { amount: paid.paymentAmount },
    });
    await expectRejected(replay, 'Double capture');

    const payment = await expectOk<PaymentView>(await buyer.get(`/payment/my/${paid.paymentId}`));
    expect(payment.capturedAmount).toBe(payment.amount);
  });

  test('keeps refunds on the admin scope', async ({
    admin,
    buyer,
    apiAs,
    cleanup,
    canAuthenticateAs,
  }) => {
    test.skip(!(await canAuthenticateAs('vendor')), 'Requires a vendor access token.');

    const paid = await buildPaidOrder({ admin, buyer, vendor: await apiAs('vendor'), cleanup });

    const asBuyer = await buyer.post(`/payment/admin/${paid.paymentId}/refund`, {
      data: { amount: 1, reason: 'Buyer self-refund attempt.' },
    });
    await expectAuthRejected(asBuyer, 'Buyer refund attempt');

    const refundable = await expectOk<{ refundedAmount?: number }>(
      await admin.post(`/payment/admin/${paid.paymentId}/refund`, {
        data: { amount: paid.paymentAmount, reason: 'E2E admin refund.' },
      }),
    );
    expect(refundable).toBeDefined();
  });

  test('refuses a payout larger than the ledger balance', async ({
    admin,
    buyer,
    apiAs,
    cleanup,
    canAuthenticateAs,
  }) => {
    test.skip(!(await canAuthenticateAs('vendor')), 'Requires a vendor access token.');

    const vendor = await apiAs('vendor');
    await buildPaidOrder({ admin, buyer, vendor, cleanup });
    const { balance } = await expectOk<Balance>(await vendor.get('/payout/vendor/me/balance'));

    const overdraft = await vendor.post('/payout/vendor/me', {
      data: {
        amount: balance + 1_000,
        currency: 'USD',
        method: 'manual',
        destinationRef: 'e2e-overdraft',
      },
    });
    await expectRejected(overdraft, 'Over-balance payout');

    if (databaseConfigured()) {
      const pending = await countDocuments('payouts', { destinationRef: 'e2e-overdraft' });
      expect(pending, 'A refused payout must not create a row.').toBe(0);
    }
  });

  test('accepts a payout inside the balance and debits the ledger', async ({
    admin,
    buyer,
    apiAs,
    cleanup,
    canAuthenticateAs,
  }) => {
    test.skip(!(await canAuthenticateAs('vendor')), 'Requires a vendor access token.');

    const vendor = await apiAs('vendor');
    await buildPaidOrder({ admin, buyer, vendor, cleanup });
    const before = await expectOk<Balance>(await vendor.get('/payout/vendor/me/balance'));
    test.skip(
      before.balance <= 0,
      'The sale did not credit the ledger, so there is nothing to pay out.',
    );

    const payoutResponse = await vendor.post('/payout/vendor/me', {
      data: {
        amount: before.balance,
        currency: 'USD',
        method: 'manual',
        destinationRef: 'e2e-withdrawal',
      },
    });
    expect(payoutResponse.status()).toBe(201);
    const payout = await expectOk<PayoutView>(payoutResponse);
    expect(payout.status).toBeDefined();
    cleanup.addRequest(
      'payout cancel',
      admin,
      'post',
      `/payout/admin/${payout.id}/cancel`,
      { reason: 'E2E cleanup.' },
      [400, 404],
    );

    const after = await expectOk<Balance>(await vendor.get('/payout/vendor/me/balance'));
    expect(after.balance).toBeCloseTo(0, 2);
  });
});
