import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { ReviewModel } from '../../infrastructure/review.model';
import {
  integrationEnabled,
  type ApiIntegrationHarness,
} from '../../../../testing/api-integration-harness';
import {
  createSecurityKit,
  expectRejected,
  expectUnauthorized,
  type AttackResult,
  type SecurityKit,
  type Tenant,
} from '../../../../testing/security-kit';

let kit: SecurityKit;
let harness: ApiIntegrationHarness;

const reviewBody = (productId: string, orderId: string, comment: string) => ({
  productId,
  orderId,
  rating: 5,
  title: 'Exploit review',
  comment,
});

const postReview = async (tenant: Tenant, body: unknown): Promise<AttackResult> =>
  await kit.send(tenant, '/review/my', { method: 'POST', body });

async function seedReview() {
  const context = await harness.seedOrder({ available: 10, quantity: 2 });
  const created = harness.expectSuccess<{ updatedData: { _id: string } }>(
    await harness.requestAs('buyer', '/review/my', {
      method: 'POST',
      body: reviewBody(context.productId, context.orderId, 'Baseline review for the exploit suite.'),
    }),
  );
  harness.track(created.updatedData._id);
  return { ...context, reviewId: created.updatedData._id };
}

describe.skipIf(!integrationEnabled)('reviews API database integration', () => {
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

  // ---------------------------------------------------------------- baseline

  it('creates a verified review from a buyer order', async () => {
    const context = await seedReview();
    harness.events.length = 0;

    const review = await ReviewModel.findById(context.reviewId).lean();
    expect(review?.productId).toBe(context.productId);
    expect(review?.orderId).toBe(context.orderId);
    expect(review?.authorId).toBe(harness.userIds.buyer);
    expect(review?.isVerifiedPurchase).toBe(true);
  }, 30_000);

  it('rejects a rating outside the 1-5 range', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });

    const created = await postReview('buyer', {
      ...reviewBody(context.productId, context.orderId, 'Out of range.'),
      rating: 6,
    });
    expect(created.status).toBe(400);
    expect(await ReviewModel.countDocuments({ productId: context.productId })).toBe(0);
  }, 30_000);

  it('likes a review and stores a vendor reply', async () => {
    const context = await seedReview();

    harness.expectSuccess(
      await harness.requestAs('buyer', `/review/my/${context.reviewId}/like`, { method: 'POST' }),
    );
    harness.expectSuccess(
      await harness.requestAs('vendor', `/review/vendor/${context.reviewId}/reply`, {
        method: 'POST',
        body: { reply: 'Thank you for the feedback.' },
      }),
    );

    const review = await ReviewModel.findById(context.reviewId).lean();
    expect(review?.likes).toBe(1);
    expect(review?.vendorReply).toBe('Thank you for the feedback.');
    expect(harness.events).toContain('review.vendor-reply-added');
  }, 30_000);

  // ------------------------------------------------------------- exploit set

  /**
   * FINDING ECON-05a — unlimited reviews per author and product. The
   * repository already exposes `ExistsByAuthorAndProduct`; no use case calls
   * it, so one account owns the whole rating.
   */
  it.failing('stops one account from posting several reviews for the same product', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    expect(context.productId.length).toBeGreaterThan(0);

    const results: AttackResult[] = [];
    for (let index = 0; index < 5; index += 1) {
      const result = await postReview(
        'buyer',
        reviewBody(context.productId, context.orderId, `Brigade review ${index}`),
      );
      results.push(result);
      const body = result.body as { success?: boolean; data?: { updatedData?: { _id?: string } } };
      const reviewId = body.data?.updatedData?._id;
      if (reviewId !== undefined) harness.track(reviewId);
    }

    const rows = await ReviewModel.countDocuments({ productId: context.productId });
    const listing = harness.expectSuccess<{ data: unknown[] }>(
      await harness.requestAs('buyer', `/review/product/${context.productId}`),
    );

    kit.evidence('ECON-05a', {
      posts: results.length,
      statuses: kit.statuses(results),
      rowsInDb: rows,
      publicEntries: listing.data.length,
    });

    expect(rows, 'Five reviews from one account for one product.').toBe(1);
    expect(kit.accepted(results).length).toBe(1);
  }, 30_000);

  /** FINDING ECON-05b — a review can cite an order the author does not own. */
  it.failing('rejects a review attributed to another buyer order', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    expect(context.orderId.length).toBeGreaterThan(0);

    const forged = await postReview(
      'buyerAlt',
      reviewBody(context.productId, context.orderId, 'Review on a foreign order.'),
    );
    const body = forged.body as { data?: { updatedData?: { _id?: string } } };
    if (body.data?.updatedData?._id !== undefined) harness.track(body.data.updatedData._id);

    const stored = await ReviewModel.findOne({ orderId: context.orderId, authorId: { $ne: harness.userIds.buyer } }).lean();

    kit.evidence('ECON-05b', {
      foreignOrderStatus: forged.status,
      storedOrderId: stored?.orderId,
      authorOwnsOrder: false,
    });

    expect(forged.status, 'Review accepted for an order the author does not own.').toBe(400);
    expect(stored).toBeNull();
  }, 30_000);

  /** FINDING ECON-05c — no purchase is required at all; the order id is decoration. */
  it.failing('rejects a review with no matching purchase', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    const inventedOrderId = Id.create().value;

    const invented = await postReview(
      'buyerAlt',
      reviewBody(context.productId, inventedOrderId, 'Bought nothing, rated five.'),
    );
    const body = invented.body as { data?: { updatedData?: { _id?: string } } };
    if (body.data?.updatedData?._id !== undefined) harness.track(body.data.updatedData._id);

    kit.evidence('ECON-05c', {
      inventedOrderStatus: invented.status,
      storedForInventedOrder: await ReviewModel.countDocuments({ orderId: inventedOrderId }),
    });

    expect(invented.status, 'Review accepted with an order that does not exist.').toBe(400);
  }, 30_000);

  /**
   * FINDING REV-03 — `likeReview(id)` never receives the actor. Twenty-five
   * requests from one account stack into twenty-five likes on the public
   * counter, which is what the storefront sorts by.
   */
  it.failing('counts a like from one account only once', async () => {
    const context = await seedReview();
    expect(context.reviewId.length).toBeGreaterThan(0);

    const attempts = 25;
    const results: AttackResult[] = [];
    // Sequential on purpose: each like succeeds on its own, so this measures
    // the missing per-account rule rather than an optimistic-lock collision.
    for (let index = 0; index < attempts; index += 1) {
      results.push(
        await kit.send('buyerAlt', `/review/my/${context.reviewId}/like`, { method: 'POST' }),
      );
    }
    const review = await ReviewModel.findById(context.reviewId).lean();

    kit.evidence('REV-03', {
      likeRequests: attempts,
      accepted: kit.accepted(results).length,
      storedLikes: review?.likes,
    });

    expect(review?.likes, 'Repeated likes from one account must not stack.').toBeLessThanOrEqual(1);
  }, 30_000);

  /** FINDING REV-03b — the author can like their own review. */
  it.failing('stops an author from liking their own review', async () => {
    const context = await seedReview();
    expect(context.reviewId.length).toBeGreaterThan(0);

    const selfLike = await kit.send('buyer', `/review/my/${context.reviewId}/like`, {
      method: 'POST',
    });
    const review = await ReviewModel.findById(context.reviewId).lean();

    kit.evidence('REV-03b', {
      selfLikeStatus: selfLike.status,
      storedLikes: review?.likes,
      isAuthor: true,
    });

    expect(selfLike.status, 'The author liked their own review.').toBe(400);
    expect(review?.likes).toBe(0);
  }, 30_000);

  /** FINDING REV-04 — repeated dislikes from one account bury a competitor. */
  it.failing('counts one dislike per account instead of per request', async () => {
    const context = await seedReview();
    const attempts = 25;
    for (let index = 0; index < attempts; index += 1) {
      await kit.send('buyerAlt', `/review/my/${context.reviewId}/dislike`, { method: 'POST' });
    }
    const review = await ReviewModel.findById(context.reviewId).lean();

    kit.evidence('REV-04', { dislikeRequests: attempts, storedDislikes: review?.dislikes });

    expect(review?.dislikes, 'One account buried a review with repeated dislikes.').toBeLessThanOrEqual(
      1,
    );
  }, 30_000);

  // ------------------------------------------------------ controls that held

  /**
   * FINDING REV-05 — a foreign write to someone else's review is answered with
   * a 500 rather than a 4xx: the actor check throws an internal error. The
   * write is stopped, but the client sees a server failure, and error-shaped
   * probing reveals which ids exist.
   */
  it.failing('answers a foreign review write with a client error', async () => {
    const context = await seedReview();
    expect(context.reviewId.length).toBeGreaterThan(0);

    const foreignEdit = await kit.send('buyerAlt', `/review/my/${context.reviewId}`, {
      method: 'PATCH',
      body: { rating: 1, title: 'Hijacked', comment: 'Edited by a stranger.' },
    });
    const foreignDelete = await kit.send('buyerAlt', `/review/my/${context.reviewId}`, {
      method: 'DELETE',
    });

    const review = await ReviewModel.findById(context.reviewId).lean();
    kit.evidence('REV-05', {
      foreignEditStatus: foreignEdit.status,
      foreignDeleteStatus: foreignDelete.status,
      titleAfter: review?.title,
      deleted: review?.deleted.deleted,
    });

    expectRejected(foreignEdit, 'Foreign review edit');
    expectRejected(foreignDelete, 'Foreign review delete');
    expect(review?.title).toBe('Exploit review');
    expect(review?.deleted.deleted).toBe(false);
  }, 30_000);

  it('refuses a vendor reply on a product it does not own', async () => {
    const context = await seedReview();
    await kit.vendorProfileFor('vendorAlt');

    const reply = await kit.send('vendorAlt', `/review/vendor/${context.reviewId}/reply`, {
      method: 'POST',
      body: { reply: 'A competitor replying on someone else product.' },
    });
    expectRejected(reply, 'Foreign vendor reply');

    const review = await ReviewModel.findById(context.reviewId).lean();
    expect(review?.vendorReply ?? null).toBeNull();
  }, 30_000);

  it('stops an anonymous caller from writing a review', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    const created = await kit.sendAnonymously('/review/my', {
      method: 'POST',
      body: reviewBody(context.productId, context.orderId, 'Anonymous review.'),
    });
    expectUnauthorized(created, 'Anonymous review creation');
  }, 30_000);
});
