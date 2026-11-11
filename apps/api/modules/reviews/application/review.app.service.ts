import { PersonName } from '@ecomerece/domain';
import type { IEventBus } from '@ecomerece/domain/events/event-bus.interface';
import { ReviewAggregate } from '@ecomerece/domain/modules/reviews/reviews.aggregate';
import type { IQueryBus } from '@ecomerece/domain/query/query-bus.interface';
import { DeleteInfoVO } from '@ecomerece/domain/value-objects/delete-info.vo';
import { Description } from '@ecomerece/domain/value-objects/description.vo';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import { Reason } from '@ecomerece/domain/value-objects/reason.vo';
import { Title } from '@ecomerece/domain/value-objects/title.vo';
import { UrlVO } from '@ecomerece/domain/value-objects/url.vo';
import type {
  addVendorReplyDtoType,
  blockReviewDtoType,
  createMyReviewDtoType,
  deleteMyReviewDtoType,
  GetAdminPaginatedReviewsQueryDto,
  GetPaginatedReviewsQueryDto,
  reportReviewDtoType,
  updateMyReviewDtoType,
} from '@ecomerece/shared';
import type { FilterQuery } from 'mongoose';
import type { ReviewResponseReadModel } from '../../../../../packages/shared/types/responses-read-models/review.response-read-model';
import { BaseService } from '../../../core/services/base.services';
import { BadRequestError } from '../../../errors/app-error';
import {
  EnsureActiveOrderGetByIdQuery,
  EnsureActiveProductGetByIdQuery,
  GetVendorByUserIdQuery,
} from '@ecomerece/contracts';
import type { AuthActor } from '@ecomerece/contracts';
import { reviewMapper } from '../infrastructure/review.mapper';
import type { ReviewPersistence } from '../infrastructure/review.model';
import type { ReviewRepository } from '../infrastructure/review.repository';
import { type ReviewMessagesType, reviewMessages } from '../presentation/review.messages';

export class ReviewApplicationService extends BaseService {
  constructor(
    private readonly queryBus: IQueryBus,
    private readonly reviewRepo: ReviewRepository,
    private readonly eventBus: IEventBus,
  ) {
    super();
  }

  private async publishEvents(review: ReviewAggregate): Promise<void> {
    const events = review.pullEvents();
    if (events.length > 0) {
      await this.eventBus.publish(events);
    }
  }

  async getReviewById(id: string): Promise<ReviewResponseReadModel> {
    const reviewId = Id.create(id);
    const review = await this.reviewRepo.FindByIdOrThrow(reviewId);
    return reviewMapper.aggregateToResponseReadModel(review);
  }

  async getReviewsByProductId(productId: string): Promise<ReviewResponseReadModel[]> {
    const pId = Id.create(productId);
    const reviews = await this.reviewRepo.FindByProductId(pId);
    return reviews.map((review) => reviewMapper.aggregateToResponseReadModel(review));
  }
  // Public: non-deleted, non-blocked reviews — optionally filter by product / rating
  async getPaginatedReviews(query: GetPaginatedReviewsQueryDto) {
    const filter: FilterQuery<ReviewPersistence> = {
      'deleted.deleted': false,
      'block.blocked': { $ne: true },
    };
    if (query.productId) filter.productId = Id.create(query.productId).value;
    if (query.rating !== undefined) filter.rating = query.rating;

    const cursor = query.cursor ? Id.create(query.cursor) : undefined;
    const limit = query.limit ? Quantity.create(query.limit) : undefined;
    const result = await this.reviewRepo.FindPaginated({
      filter,
      cursor,
      limit,
      direction: query.direction,
    });

    return {
      data: result.data.map((review) => reviewMapper.aggregateToReadModel(review)),
      meta: result.meta,
    };
  }

  // Admin: all reviews — no baseline restrictions, optional filters
  async findAdminPaginatedReviews(query: GetAdminPaginatedReviewsQueryDto) {
    const filter: FilterQuery<ReviewPersistence> = {};
    if (query.productId) filter.productId = Id.create(query.productId).value;
    if (query.authorId) filter.authorId = Id.create(query.authorId).value;
    if (query.rating !== undefined) filter.rating = query.rating;
    if (query.deleted !== undefined) filter['deleted.deleted'] = query.deleted;

    const cursor = query.cursor ? Id.create(query.cursor) : undefined;
    const limit = query.limit ? Quantity.create(query.limit) : undefined;
    const result = await this.reviewRepo.FindPaginated({
      filter,
      cursor,
      limit,
      direction: query.direction,
    });

    return {
      data: result.data.map((review) => reviewMapper.aggregateToReadModel(review)),
      meta: result.meta,
    };
  }

  async createReview(
    data: createMyReviewDtoType,
    actor: AuthActor,
  ): Promise<ReviewMessagesType> {
    const reviewId = Id.create();
    const actorId = Id.create(actor._id);
    const productId = Id.create(data.productId);
    const orderId = data.orderId ? Id.create(data.orderId) : null;
    const rating = Quantity.create(data.rating);
    const title = Title.create(data.title);
    const comment = Description.create(data.comment);
    const authorAvatar = UrlVO.create(actor.image);
    const images = data.images ? data.images.map((value) => UrlVO.create(value)) : [];
    const authorName = PersonName.create(actor.name.fullName);
    let verified = false;
    if (orderId) {
      const activeOrder = await this.queryBus.execute(
        new EnsureActiveOrderGetByIdQuery({ orderId: orderId }),
      );

      if (activeOrder.active) if (activeOrder.order?.buyerId == actorId.value) verified = true;
    }
    const review = ReviewAggregate.create({
      id: reviewId,
      productId: productId,
      authorId: actorId,
      authorName: authorName,
      authorAvatar: authorAvatar,
      orderId: orderId ?? null,
      rating: rating,
      title: title,
      comment: comment,
      images: images,
      isVerifiedPurchase: verified,
    });
    await this.reviewRepo.Create(review);
    await this.publishEvents(review);
    return reviewMessages.reviewCreated(
      reviewId,
      actorId,
      reviewMapper.aggregateToResponseReadModel(review),
    );
  }

  async updateMyReview(
    id: string,
    data: updateMyReviewDtoType,
    actor: AuthActor,
  ): Promise<ReviewMessagesType> {
    const reviewId = Id.create(id);
    const actorId = Id.create(actor._id);
    const review = await this.reviewRepo.EnsureAuthorOwnershipGetByIdOrThrow(actorId, reviewId);
    review.updateContent(
      Title.create(data.title),
      Description.create(data.comment),
      data.images ? data.images.map((value) => UrlVO.create(value)) : review.images,
      Quantity.create(data.rating),
    );
    await this.reviewRepo.Save(review);
    await this.publishEvents(review);
    return reviewMessages.reviewUpdated(reviewId, actorId);
  }

  async deleteMyReview(
    id: string,
    data: deleteMyReviewDtoType,
    actor: AuthActor,
  ): Promise<ReviewMessagesType> {
    const reviewId = Id.create(id);
    const actorId = Id.create(actor._id);
    const review = await this.reviewRepo.EnsureAuthorOwnershipGetByIdOrThrow(actorId, reviewId);
    review.deleteReview(DeleteInfoVO.create(actorId, Reason.create(data.reason)));
    await this.reviewRepo.Save(review);
    await this.publishEvents(review);
    return reviewMessages.reviewDeleted(reviewId, actorId);
  }

  async likeReview(id: string): Promise<ReviewMessagesType> {
    const reviewId = Id.create(id);
    const review = await this.reviewRepo.FindByIdOrThrow(reviewId);
    review.like();
    await this.reviewRepo.Save(review);
    await this.publishEvents(review);
    return reviewMessages.reviewLiked(reviewId);
  }

  async dislikeReview(id: string): Promise<ReviewMessagesType> {
    const reviewId = Id.create(id);
    const review = await this.reviewRepo.FindByIdOrThrow(reviewId);
    review.dislike();
    await this.reviewRepo.Save(review);
    await this.publishEvents(review);
    return reviewMessages.reviewDisliked(reviewId);
  }

  async reportReview(
    id: string,
    data: reportReviewDtoType,
    actor: AuthActor,
  ): Promise<ReviewMessagesType> {
    const reviewId = Id.create(id);
    const actorId = Id.create(actor._id);
    const review = await this.reviewRepo.FindByIdOrThrow(reviewId);
    review.report(Reason.create(data.reason));
    await this.reviewRepo.Save(review);
    await this.publishEvents(review);
    return reviewMessages.reviewReported(reviewId, actorId);
  }

  async addVendorReply(
    id: string,
    data: addVendorReplyDtoType,
    actor: AuthActor,
  ): Promise<ReviewMessagesType> {
    const reviewId = Id.create(id);
    const actorId = Id.create(actor._id);
    const review = await this.reviewRepo.FindByIdOrThrow(reviewId);
    const activeProduct = await this.queryBus.execute(
      new EnsureActiveProductGetByIdQuery({ productId: review.productId }),
    );
    if (!activeProduct.product) throw new BadRequestError('Product not found.');
    if (!activeProduct.active) throw new BadRequestError('Product is not active.');
    const vendor = await this.queryBus.execute(
      new GetVendorByUserIdQuery({ userId: actorId }),
    );
    if (!vendor) throw new BadRequestError('User does not own a vendor.');
    if (vendor.id !== activeProduct.product.vendorId) {
      throw new BadRequestError('This review does not belong to the current vendor.');
    }
    review.addVendorReply(Description.create(data.reply));
    await this.reviewRepo.Save(review);
    await this.publishEvents(review);
    return reviewMessages.vendorReplyAdded(reviewId, Id.create(vendor.id));
  }

  async blockReview(
    id: string,
    data: blockReviewDtoType,
    actor: AuthActor,
  ): Promise<ReviewMessagesType> {
    const reviewId = Id.create(id);
    const actorId = Id.create(actor._id);
    const review = await this.reviewRepo.FindByIdOrThrow(reviewId);
    review.blockReview(Reason.create(data.reason), actorId);
    await this.reviewRepo.Save(review);
    await this.publishEvents(review);
    return reviewMessages.reviewBlocked(reviewId, actorId);
  }

  async unblockReview(id: string, actor: AuthActor): Promise<ReviewMessagesType> {
    const reviewId = Id.create(id);
    const actorId = Id.create(actor._id);
    const review = await this.reviewRepo.FindByIdOrThrow(reviewId);
    review.unblockReview(actorId);
    await this.reviewRepo.Save(review);
    await this.publishEvents(review);
    return reviewMessages.reviewUnblocked(reviewId, actorId);
  }
}
