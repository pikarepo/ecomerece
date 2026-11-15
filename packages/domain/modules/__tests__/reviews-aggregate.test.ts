import { describe, expect, it } from 'bun:test';
import { BadRequestError } from '../../errors/app-error';
import {
  DeleteInfoVO,
  Description,
  Id,
  Name,
  Quantity,
  Reason,
  Title,
  UrlVO,
} from '../../value-objects';
import { ReviewAggregate } from '../reviews/reviews.aggregate';

const id = (n: number) => Id.create(`00000000-0000-7000-8000-${String(n).padStart(12, '0')}`);
const reason = () => Reason.create('violates the marketplace policy');
const comment = () => Description.create('A detailed and honest comment.');
const image = (name: string) => UrlVO.create(`https://cdn.example.com/${name}.png`);

function review() {
  return ReviewAggregate.create({
    id: id(700),
    productId: id(400),
    authorId: id(7),
    authorName: Name.create('Jane Doe'),
    authorAvatar: image('avatar'),
    orderId: id(20),
    rating: Quantity.create(5),
    title: Title.create('Great product'),
    comment: comment(),
    images: [image('review-one')],
    isVerifiedPurchase: true,
  });
}

function deletedReview() {
  const aggregate = review();
  aggregate.deleteReview(DeleteInfoVO.create(id(9), reason()));
  aggregate.clearEvents();
  return aggregate;
}

describe('ReviewAggregate creation', () => {
  it('starts with zero counters and defaults for optional fields', () => {
    const aggregate = ReviewAggregate.create({
      id: id(700),
      productId: id(400),
      authorId: id(7),
      authorName: Name.create('Jane Doe'),
      authorAvatar: image('avatar'),
      rating: Quantity.create(4),
      title: Title.create('Good product'),
      comment: comment(),
    });

    expect(aggregate.likes.value).toBe(0);
    expect(aggregate.dislikes.value).toBe(0);
    expect(aggregate.reportCount.value).toBe(0);
    expect(aggregate.reportReasons).toEqual([]);
    expect(aggregate.orderId).toBeNull();
    expect(aggregate.images).toEqual([]);
    expect(aggregate.isVerifiedPurchase).toBe(false);
    expect(aggregate.vendorReply).toBeNull();
    expect(aggregate.delete.isDeleted).toBe(false);
    expect(aggregate.block.isBlocked).toBe(false);
    expect(aggregate.pullEvents().map((event) => event.type)).toEqual(['review.created']);
  });
});

describe('ReviewAggregate engagement', () => {
  it('counts likes and dislikes separately', () => {
    const aggregate = review();
    aggregate.clearEvents();

    aggregate.like();
    aggregate.like();
    aggregate.dislike();

    expect(aggregate.likes.value).toBe(2);
    expect(aggregate.dislikes.value).toBe(1);
    expect(aggregate.pullEvents().map((event) => event.type)).toEqual([
      'review.liked',
      'review.liked',
      'review.disliked',
    ]);
  });

  it('records every report with its reason', () => {
    const aggregate = review();
    aggregate.clearEvents();

    aggregate.report(reason());
    aggregate.report(Reason.create('harassment in the comment'));

    expect(aggregate.reportCount.value).toBe(2);
    expect(aggregate.reportReasons).toHaveLength(2);
    expect(aggregate.reportReasons[1]?.value).toBe('harassment in the comment');
    expect(aggregate.pullEvents().map((event) => event.type)).toEqual([
      'review.reported',
      'review.reported',
    ]);
  });

  it('does not let a caller mutate the report reasons or images arrays', () => {
    const aggregate = review();
    aggregate.report(reason());

    aggregate.reportReasons.push(reason());
    aggregate.images.push(image('extra'));

    expect(aggregate.reportReasons).toHaveLength(1);
    expect(aggregate.images).toHaveLength(1);
  });

  it('updates content and images with a review.updated event', () => {
    const aggregate = review();
    aggregate.clearEvents();

    aggregate.updateContent(
      Title.create('Updated title'),
      Description.create('An updated detailed comment.'),
      [image('review-two')],
      Quantity.create(3),
    );

    expect(aggregate.title.value).toBe('Updated title');
    expect(aggregate.rating.value).toBe(3);
    expect(aggregate.images.map((item) => item.value)).toEqual([image('review-two').value]);
    expect(aggregate.pullEvents().map((event) => event.type)).toEqual(['review.updated']);
  });
});

describe('ReviewAggregate vendor reply', () => {
  it('accepts one reply and refuses a second', () => {
    const aggregate = review();
    aggregate.clearEvents();

    aggregate.addVendorReply(Description.create('Thank you for the feedback.'));

    expect(aggregate.vendorReply?.value).toBe('Thank you for the feedback.');
    expect(aggregate.pullEvents().map((event) => event.type)).toEqual([
      'review.vendor-reply-added',
    ]);
    expect(() => aggregate.addVendorReply(Description.create('A second vendor reply.'))).toThrow(
      'Vendor reply has already been submitted for this review.',
    );
  });
});

describe('ReviewAggregate moderation', () => {
  it('blocks and unblocks exactly once per state', () => {
    const aggregate = review();

    aggregate.blockReview(reason(), id(9));
    expect(aggregate.block.isBlocked).toBe(true);
    expect(() => aggregate.blockReview(reason(), id(9))).toThrow('Review is already blocked.');

    aggregate.unblockReview(id(9));
    expect(aggregate.block.isBlocked).toBe(false);
    expect(() => aggregate.unblockReview(id(9))).toThrow('Review is not blocked.');
  });

  it('deletes exactly once', () => {
    const aggregate = review();

    aggregate.deleteReview(DeleteInfoVO.create(id(9), reason()));

    expect(aggregate.delete.isDeleted).toBe(true);
    expect(aggregate.pullEvents().at(-1)?.type).toBe('review.deleted');
    expect(() => aggregate.deleteReview(DeleteInfoVO.create(id(9), reason()))).toThrow(
      'Review is already deleted.',
    );
  });

  it('blocks every engagement and moderation operation once deleted', () => {
    const aggregate = deletedReview();

    expect(() => aggregate.like()).toThrow(BadRequestError);
    expect(() => aggregate.dislike()).toThrow(BadRequestError);
    expect(() => aggregate.report(reason())).toThrow(BadRequestError);
    expect(() =>
      aggregate.updateContent(Title.create('Updated title'), comment(), [], Quantity.create(1)),
    ).toThrow(BadRequestError);
    expect(() => aggregate.addVendorReply(Description.create('A vendor reply.'))).toThrow(
      BadRequestError,
    );
    expect(() => aggregate.blockReview(reason(), id(9))).toThrow(BadRequestError);
    expect(() => aggregate.unblockReview(id(9))).toThrow(BadRequestError);
  });
});
