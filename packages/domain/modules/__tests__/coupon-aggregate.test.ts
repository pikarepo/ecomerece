import { describe, expect, it } from 'bun:test';
import { BadRequestError } from '../../errors/app-error';
import { Id, Reason } from '../../value-objects';
import { CouponAggregate } from '../promotions/promotions.aggregate';
import { CouponCodeVO } from '../promotions/value-objects/coupon-code.vo';
import { DiscountTypeVO } from '../promotions/value-objects/discount-type.vo';

const id = (n: number) => Id.create(`00000000-0000-7000-8000-${String(n).padStart(12, '0')}`);
const actor = id(9);
const buyer = id(4);
const orderId = id(5);
const reason = () => Reason.create('the campaign was withdrawn before launch');
const PAST = new Date('2026-01-01T00:00:00.000Z');
const FUTURE = new Date('2099-01-01T00:00:00.000Z');

function coupon(overrides: Partial<Parameters<typeof CouponAggregate.create>[0]> = {}) {
  return CouponAggregate.create({
    id: id(900),
    code: CouponCodeVO.create('welcome10'),
    discountType: DiscountTypeVO.create('percentage'),
    discountValue: 10,
    minOrderAmount: 1000,
    maxDiscountAmount: 500,
    maxRedemptions: null,
    perBuyerLimit: 1,
    startsAt: PAST,
    expiresAt: null,
    active: true,
    ...overrides,
  });
}

describe('CouponAggregate creation', () => {
  it('normalises the code and starts with no redemptions', () => {
    const aggregate = coupon();

    expect(aggregate.code.value).toBe('WELCOME10');
    expect(aggregate.redemptionCount).toBe(0);
    expect(aggregate.active).toBe(true);
  });

  it('refuses a percentage above 100 and non-positive values', () => {
    expect(() => coupon({ discountValue: 120 })).toThrow(BadRequestError);
    expect(() => coupon({ discountValue: 0 })).toThrow(BadRequestError);
  });

  it('refuses an expiry that is not after the start', () => {
    expect(() => coupon({ expiresAt: PAST })).toThrow(BadRequestError);
  });

  it('refuses malformed codes and limits below one', () => {
    expect(() => CouponCodeVO.create('ab')).toThrow(BadRequestError);
    expect(() => CouponCodeVO.create('BAD CODE')).toThrow(BadRequestError);
    expect(() => coupon({ perBuyerLimit: 0 })).toThrow(BadRequestError);
  });
});

describe('CouponAggregate discount calculation', () => {
  it('applies a percentage and caps it', () => {
    const aggregate = coupon({ discountValue: 10, maxDiscountAmount: 500 });

    expect(aggregate.calculateDiscount(2000)).toBe(200);
    expect(aggregate.calculateDiscount(9000)).toBe(500);
  });

  it('rounds a percentage to two decimals', () => {
    expect(coupon({ discountValue: 7.5 }).calculateDiscount(19.99)).toBe(1.5);
  });

  it('never discounts more than the subtotal for a fixed code', () => {
    const aggregate = coupon({ discountType: DiscountTypeVO.create('fixed'), discountValue: 300 });

    expect(aggregate.calculateDiscount(1000)).toBe(300);
    expect(aggregate.calculateDiscount(120)).toBe(120);
    expect(aggregate.calculateDiscount(0)).toBe(0);
  });
});

describe('CouponAggregate eligibility', () => {
  it('accepts a live code above the minimum order', () => {
    expect(coupon().refusalReason(2500, 0)).toBeNull();
  });

  it('refuses inactive, not-started, expired and below-minimum baskets', () => {
    expect(coupon({ active: false }).refusalReason(2500, 0)).toBe('This coupon is not active.');
    expect(coupon({ startsAt: FUTURE }).refusalReason(2500, 0)).toBe(
      'This coupon is not valid yet.',
    );
    expect(
      coupon({ startsAt: PAST, expiresAt: new Date('2026-02-01T00:00:00.000Z') }).refusalReason(
        2500,
        0,
      ),
    ).toBe('This coupon has expired.');
    expect(coupon().refusalReason(500, 0)).toContain('requires a minimum order');
  });

  it('enforces the redemption cap and the per-buyer limit', () => {
    const capped = coupon({ maxRedemptions: 1 });
    capped.redeem({
      buyerId: buyer,
      orderId,
      subtotal: 2500,
      buyerRedemptionCount: 0,
      actorId: buyer,
    });

    expect(capped.refusalReason(2500, 0)).toBe('This coupon has reached its redemption limit.');
    expect(coupon({ perBuyerLimit: 2 }).refusalReason(2500, 2)).toBe(
      'You have already used this coupon the maximum number of times.',
    );
  });
});

describe('CouponAggregate redemption', () => {
  it('increments the counter and raises coupon.redeemed with the discount', () => {
    const aggregate = coupon();

    const discount = aggregate.redeem({
      buyerId: buyer,
      orderId,
      subtotal: 2500,
      buyerRedemptionCount: 0,
      actorId: buyer,
    });

    expect(discount).toBe(250);
    expect(aggregate.redemptionCount).toBe(1);
    const [event] = aggregate.pullEvents();
    expect(event?.type).toBe('coupon.redeemed');
    expect(event?.payload).toMatchObject({ couponId: id(900), orderId, discountAmount: 250 });
  });

  it('refuses a second redemption once the buyer limit is reached', () => {
    const aggregate = coupon();
    aggregate.redeem({
      buyerId: buyer,
      orderId,
      subtotal: 2500,
      buyerRedemptionCount: 0,
      actorId: buyer,
    });

    expect(() =>
      aggregate.redeem({
        buyerId: buyer,
        orderId: id(6),
        subtotal: 2500,
        buyerRedemptionCount: 1,
        actorId: buyer,
      }),
    ).toThrow(BadRequestError);
  });
});

describe('CouponAggregate lifecycle', () => {
  it('activates and deactivates once each', () => {
    const aggregate = coupon();

    aggregate.deactivate(actor);
    expect(aggregate.active).toBe(false);
    expect(aggregate.pullEvents().at(-1)?.type).toBe('coupon.deactivated');
    expect(() => aggregate.deactivate(actor)).toThrow(BadRequestError);

    aggregate.activate(actor);
    expect(aggregate.active).toBe(true);
    expect(aggregate.pullEvents().at(-1)?.type).toBe('coupon.activated');

    expect(() => aggregate.activate(actor)).toThrow(BadRequestError);
  });

  it('updates the campaign definition', () => {
    const aggregate = coupon();

    aggregate.update(
      {
        code: CouponCodeVO.create('SUMMER20'),
        discountType: DiscountTypeVO.create('percentage'),
        discountValue: 20,
        minOrderAmount: 0,
        maxDiscountAmount: null,
        maxRedemptions: 50,
        perBuyerLimit: 2,
        startsAt: PAST,
        expiresAt: FUTURE,
        active: true,
      },
      actor,
    );

    expect(aggregate.code.value).toBe('SUMMER20');
    expect(aggregate.discountValue).toBe(20);
    expect(aggregate.pullEvents().at(-1)?.type).toBe('coupon.updated');
  });

  it('rejects an invalid update without applying it', () => {
    const aggregate = coupon();

    expect(() =>
      aggregate.update(
        {
          code: CouponCodeVO.create('BADUPDATE'),
          discountType: DiscountTypeVO.create('percentage'),
          discountValue: 150,
          minOrderAmount: 0,
          maxDiscountAmount: null,
          maxRedemptions: null,
          perBuyerLimit: 1,
          startsAt: PAST,
          expiresAt: null,
          active: true,
        },
        actor,
      ),
    ).toThrow(BadRequestError);
  });

  it('soft deletes and recovers, blocking redemption while deleted', () => {
    const aggregate = coupon();

    aggregate.deleteCoupon(reason(), actor);
    expect(aggregate.delete.isDeleted).toBe(true);
    expect(aggregate.refusalReason(2500, 0)).toBe('This coupon no longer exists.');

    aggregate.recoverCoupon(actor);
    expect(aggregate.delete.isDeleted).toBe(false);
    expect(() => aggregate.recoverCoupon(actor)).toThrow(BadRequestError);
  });

  it('blocks redemption and updates while deleted', () => {
    const aggregate = coupon();
    aggregate.deleteCoupon(reason(), actor);

    expect(() =>
      aggregate.redeem({
        buyerId: buyer,
        orderId,
        subtotal: 2500,
        buyerRedemptionCount: 0,
        actorId: buyer,
      }),
    ).toThrow(BadRequestError);
    expect(() => aggregate.deactivate(actor)).toThrow(BadRequestError);
  });
});

function domainEvidence(tag: string, data: Record<string, unknown>) {
  console.log(`[DOM-${tag}] ${JSON.stringify(data)}`);
}

describe('hostile coupon numeric validation', () => {
  it.failing('DOM-T3 create accepts NaN campaign limits', () => {
    const valid = coupon();
    expect(valid.minOrderAmount).toBe(1000);
    expect(valid.maxDiscountAmount).toBe(500);
    expect(valid.maxRedemptions).toBeNull();
    expect(valid.perBuyerLimit).toBe(1);

    const exploit = coupon({
      minOrderAmount: Number.NaN,
      maxDiscountAmount: Number.NaN,
      maxRedemptions: Number.NaN,
      perBuyerLimit: Number.NaN,
    });

    domainEvidence('T3-CREATE', {
      minOrderAmount: String(exploit.minOrderAmount),
      maxDiscountAmount: String(exploit.maxDiscountAmount),
      maxRedemptions: String(exploit.maxRedemptions),
      perBuyerLimit: String(exploit.perBuyerLimit),
    });
    expect(() => coupon({ minOrderAmount: Number.NaN })).toThrow(BadRequestError);
    expect(() => coupon({ maxDiscountAmount: Number.NaN })).toThrow(BadRequestError);
    expect(() => coupon({ maxRedemptions: Number.NaN })).toThrow(BadRequestError);
    expect(() => coupon({ perBuyerLimit: Number.NaN })).toThrow(BadRequestError);
  });

  it.failing('DOM-T3 update accepts NaN campaign limits', () => {
    const exploit = coupon();
    expect(exploit.minOrderAmount).toBe(1000);
    const badDetails = {
      code: CouponCodeVO.create('NANCOUPON'),
      discountType: DiscountTypeVO.create('percentage'),
      discountValue: 10,
      minOrderAmount: Number.NaN,
      maxDiscountAmount: Number.NaN,
      maxRedemptions: Number.NaN,
      perBuyerLimit: Number.NaN,
      startsAt: PAST,
      expiresAt: null,
      active: true,
    };

    exploit.update(badDetails, actor);

    domainEvidence('T3-UPDATE', {
      minOrderAmount: String(exploit.minOrderAmount),
      maxDiscountAmount: String(exploit.maxDiscountAmount),
      maxRedemptions: String(exploit.maxRedemptions),
      perBuyerLimit: String(exploit.perBuyerLimit),
    });
    expect(() => coupon().update(badDetails, actor)).toThrow(BadRequestError);
  });

  it.failing('DOM-T3 rehydrate accepts NaN campaign limits', () => {
    const valid = coupon();
    expect(valid.minOrderAmount).toBe(1000);
    const rehydrateWithNaN = () =>
      CouponAggregate.rehydrate(
        id(901),
        valid.code,
        valid.discountType,
        valid.discountValue,
        Number.NaN,
        Number.NaN,
        Number.NaN,
        Number.NaN,
        valid.redemptionCount,
        valid.startsAt,
        valid.expiresAt,
        valid.active,
        valid.delete,
        valid.version,
        valid.createdAt,
      );

    const exploit = rehydrateWithNaN();

    domainEvidence('T3-REHYDRATE', {
      minOrderAmount: String(exploit.minOrderAmount),
      maxDiscountAmount: String(exploit.maxDiscountAmount),
      maxRedemptions: String(exploit.maxRedemptions),
      perBuyerLimit: String(exploit.perBuyerLimit),
    });
    expect(rehydrateWithNaN).toThrow(BadRequestError);
  });

  it.failing('DOM-T3 refusalReason ignores NaN minimum, cap and per-buyer limit', () => {
    expect(coupon().refusalReason(2500, 0)).toBeNull();
    expect(coupon({ minOrderAmount: 1000 }).refusalReason(500, 0)).toContain('minimum order');

    const minOrder = coupon({ minOrderAmount: Number.NaN });
    const maxRedemptions = coupon({ maxRedemptions: Number.NaN });
    const perBuyerLimit = coupon({ perBuyerLimit: Number.NaN });
    maxRedemptions.redeem({
      buyerId: buyer,
      orderId,
      subtotal: 2500,
      buyerRedemptionCount: 0,
      actorId: buyer,
    });
    const exploit = {
      minOrder: minOrder.refusalReason(0, 0),
      maxRedemptions: maxRedemptions.refusalReason(2500, 0),
      perBuyerLimit: perBuyerLimit.refusalReason(2500, 5),
    };

    domainEvidence('T3-REFUSAL', exploit);
    expect(exploit.minOrder).toContain('minimum order');
    expect(exploit.maxRedemptions).toContain('redemption limit');
    expect(exploit.perBuyerLimit).toContain('maximum number of times');
  });

  it.failing('DOM-T3 redeem pays an NaN discount and ignores NaN limits', () => {
    expect(
      coupon().redeem({
        buyerId: buyer,
        orderId,
        subtotal: 2500,
        buyerRedemptionCount: 0,
        actorId: buyer,
      }),
    ).toBe(250);
    const exploit = coupon({
      minOrderAmount: Number.NaN,
      maxDiscountAmount: Number.NaN,
      maxRedemptions: Number.NaN,
      perBuyerLimit: Number.NaN,
    });
    const discount = exploit.redeem({
      buyerId: buyer,
      orderId,
      subtotal: 5,
      buyerRedemptionCount: 99,
      actorId: buyer,
    });
    const event = exploit.pullEvents().at(-1);

    domainEvidence('T3-REDEEM', {
      discount: String(discount),
      redemptionCount: exploit.redemptionCount,
      eventType: event?.type,
    });
    expect(Number.isFinite(discount)).toBe(true);
    expect(exploit.redemptionCount).toBe(0);
  });
});
