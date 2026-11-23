import { randomUUID } from 'node:crypto';
import { clientHeaders, expectNoServerError, expectRejected } from '../../api/attack';
import { countDocuments, databaseConfigured, readDocument } from '../../api/database';
import { expectOk } from '../../api/envelope';
import { exploitEvidence, isDestructiveEnvReady } from '../../api/exploit-support';
import { type MessageData, requireRecordId, uniqueSuffix } from '../../api/identifiers';
import { withVendorLedgerLock } from '../../api/lock';
import { ensureBuyerAddress, futureWaitingTime, newIdempotentKey } from '../../api/scenarios';
import { buildPaidOrder, buildVendorWorkspace } from '../../api/world';
import { expect, test } from '../../fixtures';

const roles = ['buyer', 'vendor', 'admin'] as const;
const requiresDisposableDatabase =
  'Requires E2E_ALLOW_IRREVERSIBLE_WRITES=true, E2E_MONGO_URI and all three role tokens.';

test.describe('api transaction and data-integrity exploits', () => {
  test('invalid quantity never creates an order or mutates inventory', async ({
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
      available: 5,
    });
    const before = await readDocument<{ available: number; reserved: number; soldOut: number }>(
      'inventories',
      { _id: workspace.inventoryId },
    );
    const addressId = await ensureBuyerAddress({ buyer, suffix });
    const idempotentKey = newIdempotentKey();

    const rejected = await buyer.post('/order/my', {
      headers: clientHeaders(`${suffix}-invalid-order`),
      data: {
        idempotentKey,
        addressId,
        safeOrder: true,
        waitingTime: futureWaitingTime(),
        items: [{ variantId: workspace.variantId, quantity: -3 }],
      },
    });
    await expectRejected(rejected, 'negative quantity order');

    const orders = databaseConfigured() ? await countDocuments('orders', { idempotentKey }) : 0;
    const after = await readDocument<{ available: number; reserved: number; soldOut: number }>(
      'inventories',
      { _id: workspace.inventoryId },
    );
    expect(orders, 'A rejected order persisted an order row.').toBe(0);
    expect(after?.available).toBe(before?.available);
    expect(after?.reserved).toBe(before?.reserved);
    expect(after?.soldOut).toBe(before?.soldOut);
    exploitEvidence('TX-INVALID-ORDER', { status: rejected.status(), orders, before, after });
  });

  test('partially invalid cart never persists half an order', async ({
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
      available: 5,
    });
    const addressId = await ensureBuyerAddress({ buyer, suffix });
    const idempotentKey = newIdempotentKey();
    const inventedVariantId = randomUUID();

    const rejected = await buyer.post('/order/my', {
      headers: clientHeaders(`${suffix}-partial-order`),
      data: {
        idempotentKey,
        addressId,
        safeOrder: true,
        waitingTime: futureWaitingTime(),
        items: [
          { variantId: workspace.variantId, quantity: 1 },
          { variantId: inventedVariantId, quantity: 1 },
        ],
      },
    });
    await expectRejected(rejected, 'partially invalid order');

    const orders = databaseConfigured() ? await countDocuments('orders', { idempotentKey }) : 0;
    const items = databaseConfigured()
      ? await countDocuments('order-items', { orderKey: idempotentKey })
      : 0;
    expect(orders, 'A partially invalid order persisted a parent row.').toBe(0);
    expect(items, 'A partially invalid order persisted child rows.').toBe(0);
    exploitEvidence('TX-PARTIAL-ORDER', { status: rejected.status(), orders, items });
  });

  test('over-limit payout leaves ledger and payout rows untouched', async ({
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
      const before = await expectOk<{ balance: number }>(
        await vendor.get('/payout/vendor/me/balance'),
      );
      const destinationRef = `e2e-overdraft-${randomUUID()}`;
      const rejected = await vendor.post('/payout/vendor/me', {
        headers: clientHeaders(`${workspace.paymentId}-overdraft`),
        data: {
          amount: before.balance + 1_000_000,
          currency: 'USD',
          method: 'manual',
          destinationRef,
        },
      });
      await expectRejected(rejected, 'over-limit payout');
      const after = await expectOk<{ balance: number }>(
        await vendor.get('/payout/vendor/me/balance'),
      );
      const payouts = databaseConfigured() ? await countDocuments('payouts', { destinationRef }) : 0;
      expect(after.balance).toBe(before.balance);
      expect(payouts, 'A rejected payout persisted a payout row.').toBe(0);
      exploitEvidence('TX-OVERDRAFT', {
        status: rejected.status(),
        before: before.balance,
        after: after.balance,
        payouts,
      });
    });
  });

  test('over-return request does not write a return document', async ({
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
      await expectOk(await vendor.post(`/order-items/vendor/${workspace.itemId}/confirm`));
      await expectOk(await vendor.post(`/order-items/vendor/${workspace.itemId}/complete`));
      const reason = `e2e over-return ${randomUUID()}`;
      const rejected = await buyer.post('/return/my', {
        headers: clientHeaders(`${workspace.orderId}-over-return`),
        data: {
          orderId: workspace.orderId,
          orderItemId: workspace.itemId,
          quantity: 999_999,
          returnType: 'refund',
          reason,
        },
      });
      await expectRejected(rejected, 'over-return request');
      const rows = databaseConfigured() ? await countDocuments('returnrequests', { reason }) : 0;
      expect(rows, 'An over-return request persisted a return row.').toBe(0);
      exploitEvidence('TX-OVER-RETURN', { status: rejected.status(), rows });
    });
  });

  test('foreign vendor mutation does not change persisted product ownership', async ({
    admin,
    apiAs,
    cleanup,
    vendor,
  }) => {
    test.skip(!isDestructiveEnvReady(roles), requiresDisposableDatabase);
    const attackerVendor = await apiAs('vendorAlt');
    const victim = await buildVendorWorkspace({
      admin,
      vendor,
      cleanup,
      suffix: `${uniqueSuffix()}-victim`,
      available: 3,
    });
    const attacker = await buildVendorWorkspace({
      admin,
      vendor: attackerVendor,
      cleanup,
      suffix: `${uniqueSuffix()}-attacker`,
      available: 3,
    });
    expect(attacker.vendorId).not.toBe(victim.vendorId);
    const before = await readDocument<{ title: string }>('products', { _id: victim.productId });
    const responses = await Promise.all([
      attackerVendor.patch('/product/vendor/meta', {
        headers: clientHeaders(`${victim.productId}-foreign-meta`),
        data: {
          productId: victim.productId,
          title: `stolen ${randomUUID()}`,
          description: 'foreign vendor exploit',
          appearance: 'public',
        },
      }),
      attackerVendor.patch('/product/vendor/state/private', {
        headers: clientHeaders(`${victim.productId}-foreign-state`),
        data: { productId: victim.productId, reason: 'foreign vendor exploit' },
      }),
    ]);
    expectNoServerError(responses, 'foreign vendor mutation');
    for (const response of responses) {
      expect(response.ok(), 'A foreign vendor mutation succeeded.').toBeFalsy();
    }
    const after = await readDocument<{ title: string }>('products', { _id: victim.productId });
    expect(after?.title).toBe(before?.title);
    exploitEvidence('TX-FOREIGN-VENDOR', {
      statuses: responses.map((response) => response.status()),
      before,
      after,
    });
  });
});
