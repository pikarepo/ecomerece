import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { ReviewModel } from '../../infrastructure/review.model';
import {
  createApiIntegrationHarness,
  integrationEnabled,
  type ApiIntegrationHarness,
} from '../../../../testing/api-integration-harness';

let harness: ApiIntegrationHarness;

async function seedReview() {
  const context = await harness.seedOrder({ available: 10, quantity: 2 });
  const created = harness.expectSuccess<{ updatedData: { _id: string } }>(
    await harness.requestAs('buyer', '/review/my', {
      method: 'POST',
      body: {
        productId: context.productId,
        orderId: context.orderId,
        rating: 5,
        title: 'Great integration product',
        comment: 'This product passed the integration review flow.',
      },
    }),
  );
  const reviewId = harness.track(created.updatedData._id);
  return { ...context, reviewId };
}

describe.skipIf(!integrationEnabled)('reviews API database integration', () => {
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

  it('creates a verified review from a buyer order', async () => {
    const context = await seedReview();
    harness.events.length = 0;

    const review = await ReviewModel.findById(context.reviewId).lean();
    expect(review?.productId).toBe(context.productId);
    expect(review?.orderId).toBe(context.orderId);
    expect(review?.authorId).toBe(harness.userIds.buyer);
    expect(review?.rating).toBe(5);
    expect(review?.isVerifiedPurchase).toBe(true);
    expect(review?.block.blocked).toBe(false);
    expect(review?.deleted.deleted).toBe(false);
  }, 30_000);

  it('likes a review and stores a vendor reply', async () => {
    const context = await seedReview();
    harness.events.length = 0;

    harness.expectSuccess(
      await harness.requestAs('buyer', `/review/my/${context.reviewId}/like`, { method: 'POST' }),
    );
    harness.expectSuccess(
      await harness.requestAs('vendor', `/review/vendor/${context.reviewId}/reply`, {
        method: 'POST',
        body: { reply: 'Thank you for the detailed integration feedback.' },
      }),
    );

    const review = await ReviewModel.findById(context.reviewId).lean();
    expect(review?.likes).toBe(1);
    expect(review?.vendorReply).toBe('Thank you for the detailed integration feedback.');
    expect(harness.events).toContain('review.liked');
    expect(harness.events).toContain('review.vendor-reply-added');
  }, 30_000);
});
