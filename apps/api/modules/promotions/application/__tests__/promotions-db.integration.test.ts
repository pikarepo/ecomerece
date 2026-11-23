import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { CouponModel, CouponRedemptionModel } from '../../infrastructure/coupon.model';
import {
  integrationEnabled,
  runId,
  type ApiIntegrationHarness,
} from '../../../../testing/api-integration-harness';
import {
  createSecurityKit,
  expectRejected,
  expectUnauthorized,
  type AttackResult,
  type SecurityKit,
} from '../../../../testing/security-kit';

let kit: SecurityKit;
let harness: ApiIntegrationHarness;

function errorCode(result: AttackResult): string {
  const body = result.body as { error?: { code?: string } } | null;
  return body?.error?.code ?? 'unknown';
}

function couponCode(suffix: string) {
  return `P-${runId}-${suffix}`.toUpperCase().slice(0, 32);
}

async function createCoupon(overrides: Record<string, unknown> = {}) {
  const result = await kit.send('admin', '/promotion/admin', {
    method: 'POST',
    body: { ...couponBody(), ...overrides },
  });
  if (result.accepted) {
    const code = String((overrides.code as string) ?? couponBody().code)
      .trim()
      .toUpperCase();
    const docs = await CouponModel.find({ code }).lean();
    for (const doc of docs) harness.track(doc._id);
  }
  return result;
}

async function couponByCode(code: string) {
  return await CouponModel.findOne({ code: code.trim().toUpperCase() }).lean();
}

async function validate(code: string, subtotal: unknown) {
  const result = await kit.send('buyer', '/promotion/validate', {
    method: 'POST',
    body: { code, subtotal },
  });
  const data = (result.body as { data?: { valid?: boolean; discountAmount?: number } }).data;
  return { result, valid: data?.valid ?? false, discountAmount: data?.discountAmount ?? -1 };
}

function listedIds(result: AttackResult): string[] {
  const body = result.body as { data?: { data?: { id: string }[] } } | null;
  return (body?.data?.data ?? []).map((row) => row.id);
}

function couponBody() {
  return {
    code: `INTEGRATION-${runId}`.slice(0, 32).toUpperCase(),
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 50,
    perBuyerLimit: 1,
    startsAt: new Date(Date.now() - 60_000).toISOString(),
    expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
    active: true,
  };
}

async function seedCoupon() {
  harness.expectSuccess(
    await harness.requestAs('admin', '/promotion/admin', {
      method: 'POST',
      body: couponBody(),
    }),
    201,
  );
  const coupon = await CouponModel.findOne({ code: couponBody().code }).lean();
  if (!coupon) throw new Error('Coupon was not persisted.');
  return { coupon, couponId: harness.track(coupon._id) };
}

describe.skipIf(!integrationEnabled)('promotions API database integration', () => {
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

  it('creates a coupon through the admin route', async () => {
    const { coupon } = await seedCoupon();

    expect(coupon.code).toBe(couponBody().code);
    expect(coupon.discountType).toBe('percentage');
    expect(coupon.discountValue).toBe(10);
    expect(coupon.minOrderAmount).toBe(50);
    expect(coupon.redemptionCount).toBe(0);
    expect(coupon.active).toBe(true);
    expect(coupon.deleted.deleted).toBe(false);
    expect(harness.events).toContain('coupon.created');
  }, 30_000);

  it('deactivates and reactivates a coupon', async () => {
    const { couponId } = await seedCoupon();
    harness.events.length = 0;

    harness.expectSuccess(
      await harness.requestAs('admin', `/promotion/admin/${couponId}/deactivate`, {
        method: 'POST',
      }),
    );
    expect((await CouponModel.findById(couponId).lean())?.active).toBe(false);
    expect(harness.events).toContain('coupon.deactivated');

    harness.events.length = 0;
    harness.expectSuccess(
      await harness.requestAs('admin', `/promotion/admin/${couponId}/activate`, {
        method: 'POST',
      }),
    );

    expect((await CouponModel.findById(couponId).lean())?.active).toBe(true);
    expect(harness.events).toContain('coupon.activated');
  }, 30_000);

  it('PRM-01 keeps buyers, vendors and anonymous callers out of campaign management', async () => {
    const { couponId } = await seedCoupon();
    const attempts = [
      await kit.send('buyer', '/promotion/admin/all'),
      await kit.send('vendor', '/promotion/admin/all'),
      await kit.send('buyer', '/promotion/admin', { method: 'POST', body: couponBody() }),
      await kit.send('buyer', `/promotion/admin/${couponId}`, {
        method: 'PATCH',
        body: { discountValue: 99 },
      }),
      await kit.send('vendor', `/promotion/admin/${couponId}`, {
        method: 'DELETE',
        body: { reason: 'Vendor deleting a campaign.' },
      }),
      await kit.sendAnonymously('/promotion/validate', {
        method: 'POST',
        body: { code: couponBody().code, subtotal: 100 },
      }),
    ];

    kit.evidence('PRM-01', {
      statuses: kit.statuses(attempts).join(','),
      discountValue: (await CouponModel.findById(couponId).lean())?.discountValue,
      deleted: (await CouponModel.findById(couponId).lean())?.deleted.deleted,
    });
    for (const attempt of attempts) expectUnauthorized(attempt, 'campaign management access');
    expect((await CouponModel.findById(couponId).lean())?.discountValue).toBe(10);
    expect((await CouponModel.findById(couponId).lean())?.deleted.deleted).toBe(false);
  }, 30_000);

  it('PRM-02 refuses a duplicate code regardless of case', async () => {
    const code = couponCode('dup');
    const first = await createCoupon({ code });
    const second = await createCoupon({ code });
    const lower = await createCoupon({ code: code.toLowerCase() });
    const rows = await CouponModel.countDocuments({ code });

    kit.evidence('PRM-02', {
      firstStatus: first.status,
      secondStatus: second.status,
      lowerStatus: lower.status,
      rows,
    });
    expect(first.accepted).toBe(true);
    expectRejected(second, 'duplicate coupon code');
    expectRejected(lower, 'duplicate coupon code in lower case');
    expect(rows).toBe(1);
  }, 30_000);

  it('PRM-03 keeps one row per code when creation races', async () => {
    const code = couponCode('race');
    const before = await CouponModel.countDocuments({ code });
    expect(before, 'the racing code must be unused').toBe(0);

    const attempts = await kit.race(6, async () => createCoupon({ code }));
    const after = await CouponModel.countDocuments({ code });

    kit.evidence('PRM-03', {
      statuses: kit.statuses(attempts).join(','),
      accepted: kit.accepted(attempts).length,
      rows: after,
    });
    expect(after).toBe(1);
    expect(kit.accepted(attempts).length).toBe(1);
  }, 60_000);

  it('PRM-04 never mutates a coupon while previewing it', async () => {
    const code = couponCode('preview');
    await createCoupon({ code });
    const before = await couponByCode(code);
    harness.events.length = 0;

    const previews = await kit.race(5, async () => (await validate(code, 500)).result);
    const after = await couponByCode(code);
    const redemptions = await CouponRedemptionModel.countDocuments({ couponId: before?._id });

    kit.evidence('PRM-04', {
      statuses: kit.statuses(previews).join(','),
      countBefore: before?.redemptionCount,
      countAfter: after?.redemptionCount,
      versionBefore: before?.version,
      versionAfter: after?.version,
      redemptions,
      events: harness.events.join(','),
    });
    expect(after?.redemptionCount).toBe(0);
    expect(after?.version).toBe(before?.version);
    expect(redemptions).toBe(0);
    expect(harness.events).not.toContain('coupon.redeemed');
  }, 60_000);

  it('PRM-05 refuses inactive, scheduled, expired and deleted coupons', async () => {
    const inactive = couponCode('inactive');
    const scheduled = couponCode('scheduled');
    const expired = couponCode('expired');
    const removed = couponCode('removed');
    await createCoupon({ code: inactive, active: false });
    await createCoupon({
      code: scheduled,
      startsAt: new Date(Date.now() + 86_400_000).toISOString(),
      expiresAt: new Date(Date.now() + 172_800_000).toISOString(),
    });
    await createCoupon({
      code: expired,
      startsAt: new Date(Date.now() - 172_800_000).toISOString(),
      expiresAt: new Date(Date.now() - 86_400_000).toISOString(),
    });
    await createCoupon({ code: removed });
    const removedDoc = await couponByCode(removed);
    await kit.send('admin', `/promotion/admin/${removedDoc?._id}`, {
      method: 'DELETE',
      body: { reason: 'Preview refusal probe.' },
    });

    const results = [
      await validate(inactive, 500),
      await validate(scheduled, 500),
      await validate(expired, 500),
      await validate(removed, 500),
      await validate(couponCode('never-existed'), 500),
    ];

    kit.evidence('PRM-05', {
      valid: results.map((entry) => entry.valid).join(','),
      discounts: results.map((entry) => entry.discountAmount).join(','),
      statuses: results.map((entry) => entry.result.status).join(','),
    });
    for (const entry of results) {
      expect(entry.result.accepted).toBe(true);
      expect(entry.valid).toBe(false);
      expect(entry.discountAmount).toBe(0);
    }
  }, 60_000);

  it('PRM-06 bounds the previewed discount for abusive subtotals', async () => {
    const code = couponCode('subtotal');
    await createCoupon({ code, discountValue: 50, minOrderAmount: 0, maxDiscountAmount: 200 });
    const negative = await validate(code, -100);
    const zero = await validate(code, 0);
    const huge = await validate(code, 1e15);
    const textual = await validate(code, 'lots');
    const capped = await validate(code, 1000);

    kit.evidence('PRM-06', {
      negativeStatus: negative.result.status,
      zeroDiscount: zero.discountAmount,
      hugeDiscount: huge.discountAmount,
      textualStatus: textual.result.status,
      cappedDiscount: capped.discountAmount,
    });
    expectRejected(negative.result, 'negative subtotal');
    expectRejected(textual.result, 'non-numeric subtotal');
    expect(zero.discountAmount).toBe(0);
    expect(capped.discountAmount).toBe(200);
    expect(huge.discountAmount).toBeLessThanOrEqual(200);
    expect(huge.discountAmount).toBeGreaterThanOrEqual(0);
  }, 60_000);

  it('PRM-07 refuses a percentage above 100 on create and update', async () => {
    const { couponId } = await seedCoupon();
    const created = await createCoupon({ code: couponCode('over'), discountValue: 150 });
    const updated = await kit.send('admin', `/promotion/admin/${couponId}`, {
      method: 'PATCH',
      body: { discountValue: 150 },
    });
    const switched = await kit.send('admin', `/promotion/admin/${couponId}`, {
      method: 'PATCH',
      body: { discountType: 'fixed', discountValue: 100_000 },
    });
    const doc = await CouponModel.findById(couponId).lean();

    kit.evidence('PRM-07', {
      createdStatus: created.status,
      updatedStatus: updated.status,
      switchedStatus: switched.status,
      discountValue: doc?.discountValue,
      discountType: doc?.discountType,
    });
    expectRejected(created, 'percentage above 100 on create');
    expectRejected(updated, 'percentage above 100 on update');
    expect(switched.accepted).toBe(true);
    expect(doc?.discountValue).toBe(100_000);
    const preview = await validate(couponBody().code, 500);
    expect(preview.discountAmount).toBeLessThanOrEqual(500);
  }, 30_000);

  it.failing('PRM-08 honours deleted=false as a live-rows-only filter', async () => {
    const live = couponCode('live');
    const gone = couponCode('gone');
    await createCoupon({ code: live });
    await createCoupon({ code: gone });
    const goneDoc = await couponByCode(gone);
    await kit.send('admin', `/promotion/admin/${goneDoc?._id}`, {
      method: 'DELETE',
      body: { reason: 'Filter inversion probe.' },
    });

    const filtered = await kit.send('admin', '/promotion/admin/all?deleted=false&limit=100');
    const ids = listedIds(filtered);

    kit.evidence('PRM-08', {
      status: filtered.status,
      returned: ids.length,
      containsDeleted: ids.includes(String(goneDoc?._id)),
      containsLive: ids.includes(String((await couponByCode(live))?._id)),
    });
    expect(filtered.accepted).toBe(true);
    expect(ids).not.toContain(String(goneDoc?._id));
  }, 30_000);

  it('PRM-09 closes every write against a deleted campaign', async () => {
    const { couponId } = await seedCoupon();
    await kit.send('admin', `/promotion/admin/${couponId}`, {
      method: 'DELETE',
      body: { reason: 'Lifecycle probe deletion.' },
    });
    const attempts = [
      await kit.send('admin', `/promotion/admin/${couponId}`, {
        method: 'PATCH',
        body: { discountValue: 20 },
      }),
      await kit.send('admin', `/promotion/admin/${couponId}/activate`, { method: 'POST' }),
      await kit.send('admin', `/promotion/admin/${couponId}/deactivate`, { method: 'POST' }),
      await kit.send('admin', `/promotion/admin/${couponId}`, {
        method: 'DELETE',
        body: { reason: 'Deleting it a second time.' },
      }),
    ];
    const recover = await kit.send('admin', `/promotion/admin/${couponId}/recover`, {
      method: 'PATCH',
    });
    const recoverAgain = await kit.send('admin', `/promotion/admin/${couponId}/recover`, {
      method: 'PATCH',
    });

    kit.evidence('PRM-09', {
      statuses: kit.statuses(attempts).join(','),
      recoverStatus: recover.status,
      recoverAgainStatus: recoverAgain.status,
      deletedAfter: (await CouponModel.findById(couponId).lean())?.deleted.deleted,
    });
    for (const attempt of attempts) expectRejected(attempt, 'write against a deleted coupon');
    expect(recover.accepted).toBe(true);
    expectRejected(recoverAgain, 'recovering a live coupon');
    expect((await CouponModel.findById(couponId).lean())?.deleted.deleted).toBe(false);
  }, 30_000);

  it('PRM-10 ignores mass-assigned counters and identity on create', async () => {
    const code = couponCode('mass');
    const attackerId = Id.create().value;
    const created = await createCoupon({
      code,
      id: attackerId,
      _id: attackerId,
      redemptionCount: 999,
      deleted: { deleted: true },
      version: 42,
    });
    expect(created.accepted, 'the probe coupon must be created').toBe(true);
    const doc = await couponByCode(code);

    kit.evidence('PRM-10', {
      attackerId,
      storedId: doc?._id,
      redemptionCount: doc?.redemptionCount,
      deleted: doc?.deleted.deleted,
      version: doc?.version,
    });
    expect(doc?._id).not.toBe(attackerId);
    expect(doc?.redemptionCount).toBe(0);
    expect(doc?.deleted.deleted).toBe(false);
    expect(doc?.version).toBe(0);
  }, 30_000);

  it('PRM-11 rejects boundary codes, dates and limits', async () => {
    const attempts = [
      await createCoupon({ code: 'AB' }),
      await createCoupon({ code: 'X'.repeat(33) }),
      await createCoupon({ code: 'BAD CODE!' }),
      await createCoupon({
        code: couponCode('bad-date'),
        expiresAt: new Date(Date.now() - 86_400_000).toISOString(),
      }),
      await createCoupon({ code: couponCode('zero-discount'), discountValue: 0 }),
      await createCoupon({ code: couponCode('zero-limit'), perBuyerLimit: 0 }),
      await createCoupon({ code: couponCode('zero-max'), maxRedemptions: 0 }),
      await createCoupon({ code: couponCode('neg-min'), minOrderAmount: -1 }),
      await createCoupon({ code: couponCode('frac-limit'), perBuyerLimit: 1.5 }),
      await kit.send('admin', '/promotion/admin/all?limit=0'),
      await kit.send('admin', '/promotion/admin/all?limit=101'),
      await kit.send('admin', '/promotion/admin/all?direction=sideways'),
    ];

    kit.evidence('PRM-11', {
      statuses: kit.statuses(attempts).join(','),
      codes: attempts.map(errorCode).join(','),
    });
    for (const attempt of attempts) expectRejected(attempt, 'boundary campaign payload');
  }, 60_000);

  it('PRM-12 ignores operator-shaped filters and keeps paging bounded', async () => {
    const code = couponCode('filter');
    await createCoupon({ code });
    const operator = await kit.send('admin', '/promotion/admin/all?code[$ne]=x&limit=100');
    const exact = await kit.send('admin', `/promotion/admin/all?code=${code.toLowerCase()}`);
    const broken = await kit.send('admin', '/promotion/admin/all?cursor=nope!');

    kit.evidence('PRM-12', {
      operatorStatus: operator.status,
      operatorRows: listedIds(operator).length,
      exactStatus: exact.status,
      exactRows: listedIds(exact).length,
      brokenStatus: broken.status,
    });
    expect(operator.status).toBeLessThan(500);
    expect(exact.accepted).toBe(true);
    expect(listedIds(exact)).toHaveLength(1);
    expectRejected(broken, 'malformed cursor');
  }, 30_000);

  it.failing('PRM-13 refuses a code steal on update and keeps omitted fields', async () => {
    const taken = couponCode('taken');
    const target = couponCode('target');
    await createCoupon({ code: taken });
    await createCoupon({ code: target, discountValue: 15, minOrderAmount: 75 });
    const targetDoc = await couponByCode(target);

    const steal = await kit.send('admin', `/promotion/admin/${targetDoc?._id}`, {
      method: 'PATCH',
      body: { code: taken },
    });
    const partial = await kit.send('admin', `/promotion/admin/${targetDoc?._id}`, {
      method: 'PATCH',
      body: { discountValue: 25 },
    });
    const after = await couponByCode(target);

    kit.evidence('PRM-13', {
      stealStatus: steal.status,
      stealCode: errorCode(steal),
      partialStatus: partial.status,
      minBefore: targetDoc?.minOrderAmount,
      code: after?.code,
      discountValue: after?.discountValue,
      minOrderAmount: after?.minOrderAmount,
      takenRows: await CouponModel.countDocuments({ code: taken }),
    });
    expectRejected(steal, 'stealing an existing coupon code');
    expect(partial.accepted).toBe(true);
    expect(after?.code).toBe(target);
    expect(after?.discountValue).toBe(25);
    expect(after?.minOrderAmount).toBe(targetDoc?.minOrderAmount);
    expect(await CouponModel.countDocuments({ code: taken })).toBe(1);
  }, 30_000);
});
