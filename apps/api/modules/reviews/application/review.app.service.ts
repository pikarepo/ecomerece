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
  createMyReviewDtoType,
  GetAdminPaginatedReviewsQueryDto,
  GetPaginatedReviewsQueryDto,
} from '@ecomerece/shared';
import type { FilterQuery } from 'mongoose';
import type { ReviewResponseReadModel } from '../../../../../packages/shared/types/responses-read-models/review.response-read-model';
import { BaseService } from '../../../core/services/base.services';
import { BadRequestError } from '../../../errors/app-error';
import { EnsureActiveOrderGetByIdQuery } from '../../order/application/queries/ensure-active-order-get-by-id.query';
import type { UserPersistence } from '../../user/infrastructure/user.models';
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
      'block.blocked': false,
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
    actor: UserPersistence,
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
}
