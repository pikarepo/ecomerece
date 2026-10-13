import type { Quantity } from '@ecomerece/domain';
import type { IReviewRepository } from '@ecomerece/domain/modules/reviews/ports/i-reviews-repository';
import type { ReviewAggregate } from '@ecomerece/domain/modules/reviews/reviews.aggregate';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { FilterQuery } from 'mongoose';
import { MongoRepository } from '../../../core/repository/mongo.repository';
import { BadRequestError, ConcurrencyError } from '../../../errors/app-error';
import { reviewMapper } from './review.mapper';
import { ReviewModel, type ReviewPersistence } from './review.model';

export class ReviewRepository
  extends MongoRepository<ReviewPersistence>
  implements IReviewRepository
{
  constructor() {
    super(ReviewModel);
  }

  async FindById(id: Id): Promise<ReviewAggregate | null> {
    const doc = await super.findById(id.value);
    if (!doc) return null;
    return reviewMapper.persistenceToAggregate(doc);
  }

  async FindByIdOrThrow(id: Id): Promise<ReviewAggregate> {
    const doc = await super.findById(id.value);
    if (!doc) throw new BadRequestError('Review not found.');
    return reviewMapper.persistenceToAggregate(doc);
  }

  async FindByIds(ids: Id[]): Promise<ReviewAggregate[]> {
    const idValues = ids.map((id) => id.value);
    const docs = await super.find({
      _id: { $in: idValues },
    });
    return docs.map((doc) => reviewMapper.persistenceToAggregate(doc));
  }

  async FindByProductId(productId: Id): Promise<ReviewAggregate[]> {
    const docs = await super.find({
      productId: productId.value,
      'deleted.deleted': false,
      'block.blocked': false,
    });
    return docs.map((doc) => reviewMapper.persistenceToAggregate(doc));
  }

  async FindByAuthorId(authorId: Id): Promise<ReviewAggregate[]> {
    const docs = await super.find({
      authorId: authorId.value,
      'deleted.deleted': false,
    });
    return docs.map((doc) => reviewMapper.persistenceToAggregate(doc));
  }

  async EnsureAuthorOwnershipGetByIdOrThrow(authorId: Id, reviewId: Id): Promise<ReviewAggregate> {
    const doc = await super.findOne({
      _id: reviewId.value,
      authorId: authorId.value,
      'deleted.deleted': false,
    });
    if (!doc) throw new BadRequestError('You do not own this review.');
    return reviewMapper.persistenceToAggregate(doc);
  }

  async Create(review: ReviewAggregate): Promise<void> {
    const persistentReview = reviewMapper.aggregateToPersistence(review);
    const reviewDoc = new ReviewModel(persistentReview);
    await super.create(reviewDoc);
  }

  async Save(review: ReviewAggregate): Promise<void> {
    const data = reviewMapper.aggregateToPersistence(review);

    const result = await ReviewModel.updateOne(
      {
        _id: review.id.value,
        version: review.version.value,
      },
      {
        $set: data,
        $inc: { version: 1 },
      },
    );

    if (result.modifiedCount === 0) {
      throw new ConcurrencyError();
    }
  }

  async Delete(id: Id): Promise<void> {
    await super.findByIdAndDelete(id.value);
  }

  async Exists(id: Id): Promise<boolean> {
    return !!(await super.exists({
      _id: id.value,
    }));
  }

  async ExistsByAuthorAndProduct(authorId: Id, productId: Id): Promise<boolean> {
    return !!(await super.exists({
      authorId: authorId.value,
      productId: productId.value,
      'deleted.deleted': false,
    }));
  }

  async FindPaginated(params: {
    filter?: FilterQuery<ReviewPersistence>;
    cursor?: Id;
    limit?: Quantity;
    direction?: 'next' | 'prev';
  }): Promise<{
    data: ReviewAggregate[];
    meta: {
      nextCursor: string | null;
      prevCursor: string | null;
      hasMore: boolean;
    };
  }> {
    const result = await this.paginateByCursor({
      filter: params.filter,
      cursor: params.cursor?.value,
      limit: params.limit?.value,
      direction: params.direction,
    });

    return {
      data: result.data.map((doc: ReviewPersistence) => reviewMapper.persistenceToAggregate(doc)),
      meta: result.meta,
    };
  }
}
