import { randomUUID } from 'node:crypto';
import { clientHeaders, expectNoServerError } from '../../api/attack';
import { countDocuments, databaseConfigured, readDocument } from '../../api/database';
import { expectOk } from '../../api/envelope';
import { exploitEvidence, isDestructiveEnvReady } from '../../api/exploit-support';
import { type MessageData, requireRecordId, uniqueSuffix } from '../../api/identifiers';
import { withVendorLedgerLock } from '../../api/lock';
import {
  ensureBuyerAddress,
  futureWaitingTime,
  newIdempotentKey,
  registerOrderCleanup,
} from '../../api/scenarios';
import { buildPaidOrder, buildVendorWorkspace } from '../../api/world';
import { expect, test } from '../../fixtures';

const roles = ['buyer', 'vendor', 'admin'] as const;
const requiresDisposableDatabase =
  'Requires E2E_ALLOW_IRREVERSIBLE_WRITES=true, E2E_MONGO_URI and all three role tokens.';

test.describe('api concurrency, race and idempotency exploits', () => {
  test('oversell race cannot consume more stock than exists', async ({
    admin,
    buyer,
    cleanup,
    vendor,
  }) => {
    test.skip(!isDestructiveEnvReady(roles), requiresDisposableDatabase);
    const suffix = uniqueSuffix();
    const workspace = await buildVendorWorkspace({
      admin,
      vendor,
      cleanup,
      suffix,
      available: 1,
    });
    const addressId = await ensureBuyerAddress({ buyer, suffix });

    const responses = await Promise.all(
      Array.from({ length: 8 }, (_, index) =>
        buyer.post('/order/my', {
          headers: clientHeaders(`${suffix}-oversell-${index}`),
          data: {
            idempotentKey: newIdempotentKey(),
            addressId,
            safeOrder: true,
            waitingTime: futureWaitingTime(),
            items: [{ variantId: workspace.variantId, quantity: 1 }],
          },
        }),
      ),
    );
    expectNoServerError(responses, 'oversell race');
    const accepted = responses.filter((response) => response.ok());
    for (const response of accepted) {
      const order = await expectOk<MessageData>(response);
      registerOrderCleanup(admin, cleanup, requireRecordId(order.updatedData, 'Order'));
    }

    const inventory = await readDocument<{
      available: number;
      reserved: number;
      soldOut: number;
    }>('inventories', { _id: workspace.inventoryId });
    expect(
      accepted.length,
      `${accepted.length} concurrent orders succeeded against one available unit.`,
    ).toBeLessThanOrEqual(1);
    expect(
      inventory?.available,
      'Available stock went negative during the race.',
    ).toBeGreaterThanOrEqual(0);
    expect(
      inventory?.reserved,
      'Reserved stock went negative during the race.',
    ).toBeGreaterThanOrEqual(0);
    exploitEvidence('RACE-OVERSELL', {
      accepted: accepted.length,
      statuses: responses.map((response) => response.status()),
      inventory,
    });
  });

  test('same idempotency key fired concurrently creates one order', async ({
    admin,
    buyer,
    cleanup,
    vendor,
  }) => {
    test.skip(!isDestructiveEnvReady(roles), requiresDisposableDatabase);
    const suffix = uniqueSuffix();
    const workspace = await buildVendorWorkspace({
      admin,
      vendor,
      cleanup,
      suffix,
      available: 10,
    });
    const addressId = await ensureBuyerAddress({ buyer, suffix });
    const idempotentKey = newIdempotentKey();

    const responses = await Promise.all(
      Array.from({ length: 6 }, (_, index) =>
        buyer.post('/order/my', {
          headers: clientHeaders(`${suffix}-idem-${index}`),
          data: {
            idempotentKey,
            addressId,
            safeOrder: true,
            waitingTime: futureWaitingTime(),
            items: [{ variantId: workspace.variantId, quantity: 1 }],
          },
        }),
      ),
    );
    expectNoServerError(responses, 'idempotency race');
    const accepted = responses.filter((response) => response.ok());
    for (const response of accepted) {
      const order = await expectOk<MessageData>(response);
      registerOrderCleanup(admin, cleanup, requireRecordId(order.updatedData, 'Order'));
    }
    const rows = databaseConfigured()
      ? await countDocuments('orders', { idempotentKey })
      : accepted.length;
    expect(accepted.length, 'Concurrent replay created more than one successful response.').toBe(1);
    expect(rows, 'Concurrent replay persisted more than one order row.').toBe(1);
    exploitEvidence('RACE-IDEMPOTENCY', {
      accepted: accepted.length,
      rows,
      statuses: responses.map((response) => response.status()),
    });
  });

  test('duplicate payment capture never credits the ledger twice', async ({
    admin,
    buyer,
    cleanup,
    vendor,
  }) => {
    test.skip(!isDestructiveEnvReady(roles), requiresDisposableDatabase);
    test.setTimeout(180_000);
    await withVendorLedgerLock(async () => {
      const workspace = await buildPaidOrder({
        admin,
        buyer,
        vendor,
        cleanup,
        suffix: uniqueSuffix(),
      });
      const balanceBefore = await expectOk<{ balance: number }>(
        await vendor.get('/payout/vendor/me/balance'),
      );
      const responses = await Promise.all(
        Array.from({ length: 6 }, (_, index) =>
          buyer.post(`/payment/my/${workspace.paymentId}/capture`, {
            headers: clientHeaders(`${workspace.paymentId}-capture-${index}`),
            data: { amount: workspace.paymentAmount },
          }),
        ),
      );
      expectNoServerError(responses, 'capture race');
      const succeeded = responses.filter((response) => response.ok());
      const balanceAfter = await expectOk<{ balance: number }>(
        await vendor.get('/payout/vendor/me/balance'),
      );
      const captures = databaseConfigured()
        ? await countDocuments('ledgerentries', {
            referenceId: workspace.paymentId,
            type: 'credit',
          })
        : 1;
      expect(succeeded.length, 'Multiple capture requests succeeded.').toBeLessThanOrEqual(1);
      expect(
        balanceAfter.balance - balanceBefore.balance,
        'Duplicate capture inflated the vendor balance.',
      ).toBeLessThanOrEqual(workspace.paymentAmount);
      expect(captures, 'Duplicate capture wrote extra ledger rows.').toBeLessThanOrEqual(1);
      exploitEvidence('RACE-CAPTURE', {
        succeeded: succeeded.length,
        balanceBefore: balanceBefore.balance,
        balanceAfter: balanceAfter.balance,
        captures,
        statuses: responses.map((response) => response.status()),
      });
    });
  });

  test('coupon preview race never mutates the redemption cap', async ({
    admin,
    buyer,
    cleanup,
  }) => {
    test.skip(!isDestructiveEnvReady(roles), requiresDisposableDatabase);
    const suffix = uniqueSuffix();
    const code = `E2E-${randomUUID().slice(0, 8).toUpperCase()}`;
    const created = await expectOk<MessageData>(
      await admin.post('/promotion/admin', {
        data: {
          code,
          title: `E2E coupon ${suffix}`,
          discountType: 'percentage',
          discountValue: 10,
          maxRedemptions: 1,
          perBuyerLimit: 1,
          minOrderAmount: 1,
          maxDiscountAmount: 10,
          active: true,
          startsAt: new Date(Date.now() - 60_000).toISOString(),
          endsAt: futureWaitingTime(),
        },
      }),
    );
    const couponId = requireRecordId(created.updatedData, 'Coupon');
    cleanup.addRequest(
      'coupon',
      admin,
      'delete',
      `/promotion/admin/${couponId}`,
      undefined,
      [400, 404],
    );

    const responses = await Promise.all(
      Array.from({ length: 8 }, (_, index) =>
        buyer.post('/promotion/validate', {
          headers: clientHeaders(`${suffix}-coupon-${index}`),
          data: { code, subtotal: 100 },
        }),
      ),
    );
    expectNoServerError(responses, 'coupon race');
    const accepted = responses.filter((response) => response.ok());
    const redemptions = databaseConfigured()
      ? await countDocuments('coupons', { _id: couponId, redemptionCount: { $gte: 1 } })
      : 0;
    expect(accepted.length, 'Concurrent coupon previews must remain read-only.').toBe(8);
    expect(redemptions, 'A preview race redeemed the coupon.').toBe(0);
    exploitEvidence('RACE-COUPON-PREVIEW', {
      accepted: accepted.length,
      redemptions,
      statuses: responses.map((response) => response.status()),
    });
  });
});
