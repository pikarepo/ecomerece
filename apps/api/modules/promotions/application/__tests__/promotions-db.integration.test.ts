import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { CouponModel } from '../../infrastructure/coupon.model';
import {
  createApiIntegrationHarness,
  integrationEnabled,
  runId,
  type ApiIntegrationHarness,
} from '../../../../testing/api-integration-harness';

let harness: ApiIntegrationHarness;

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
});
