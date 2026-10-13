import { PersonName } from '@ecomerece/domain';
import type { ReviewReadModel } from '@ecomerece/domain/modules/reviews/read-models/reviews.read-model';
import { ReviewAggregate } from '@ecomerece/domain/modules/reviews/reviews.aggregate';
import { BlockInfoVO } from '@ecomerece/domain/value-objects/block-info.vo';
import { DeleteInfoVO } from '@ecomerece/domain/value-objects/delete-info.vo';
import { Description } from '@ecomerece/domain/value-objects/description.vo';
import { EffectiveDate } from '@ecomerece/domain/value-objects/effective-date.vo';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import { Reason } from '@ecomerece/domain/value-objects/reason.vo';
import { Title } from '@ecomerece/domain/value-objects/title.vo';
import { UrlVO } from '@ecomerece/domain/value-objects/url.vo';
import type { ReviewResponseReadModel } from '../../../../../packages/shared/types/responses-read-models/review.response-read-model';
import type { ReviewPersistence } from './review.model';

export const reviewMapper = {
  persistenceToAggregate(doc: ReviewPersistence): ReviewAggregate {
    return ReviewAggregate.rehydrate(
      Id.rehydrate(doc._id),
      Id.rehydrate(doc.productId),
      Id.rehydrate(doc.authorId),
      doc.orderId ? Id.rehydrate(doc.orderId) : null,
      PersonName.rehydrate(doc.authorName),
      UrlVO.rehydrate(doc.authorAvatar),
      Quantity.rehydrate(doc.reportCount),
      doc.reportReasons.map((reason) => Reason.rehydrate(reason)),
      Quantity.rehydrate(doc.rating),
      Title.rehydrate(doc.title),
      Quantity.rehydrate(doc.dislikes),
      Quantity.rehydrate(doc.likes),
      Description.rehydrate(doc.comment),
      doc.images.map((url) => UrlVO.rehydrate(url)),
      doc.isVerifiedPurchase,
      doc.vendorReply ? Description.rehydrate(doc.vendorReply) : null,
      DeleteInfoVO.rehydrate(
        doc.deleted.deletedBy ? Id.rehydrate(doc.deleted.deletedBy) : null,
        doc.deleted.deleted,
        doc.deleted.deletedFrom ? EffectiveDate.rehydrate(doc.deleted.deletedFrom) : null,
        doc.deleted.reason ? Reason.rehydrate(doc.deleted.reason) : null,
      ),

      EffectiveDate.rehydrate(doc.createdAt),
      Quantity.rehydrate(doc.version),
      EffectiveDate.rehydrate(doc.updatedAt),
    );
  },

  aggregateToPersistence(review: ReviewAggregate) {
    return {
      _id: review.id.value,
      productId: review.productId.value,
      authorId: review.authorId.value,
      orderId: review.orderId?.value ?? null,
      authorName: review.authorName.value,
      authorAvatar: review.authorAvatar.value,
      reportCount: review.reportCount.value,
      reportReasons: review.reportReasons.map((r) => r.value),
      rating: review.rating.value,
      title: review.title.value,
      dislikes: review.dislikes.value,
      likes: review.likes.value,
      comment: review.comment.value,
      images: review.images.map((img) => img.value),
      isVerifiedPurchase: review.isVerifiedPurchase,
      vendorReply: review.vendorReply?.value ?? null,
      deleted: {
        deleted: review.delete.deleted,
        deletedFrom: review.delete.from?.value ?? null,
        deletedBy: review.delete.performedBy?.value ?? null,
        reason: review.delete.reason?.value ?? null,
      },
      version: review.version.value,
      createdAt: review.createdAt.value,
      updatedAt: EffectiveDate.today().value,
    };
  },

  aggregateToReadModel(review: ReviewAggregate): ReviewReadModel {
    return {
      _id: review.id.value,
      productId: review.productId.value,
      authorId: review.authorId.value,
      orderId: review.orderId?.value ?? null,
      authorName: review.authorName.value,
      authorAvatar: review.authorAvatar.value,
      reportCount: review.reportCount.value,
      reportReasons: review.reportReasons.map((r) => r.value),
      rating: review.rating.value,
      title: review.title.value,
      dislikes: review.dislikes.value,
      likes: review.likes.value,
      comment: review.comment.value,
      images: review.images.map((img) => img.value),
      isVerifiedPurchase: review.isVerifiedPurchase,
      vendorReply: review.vendorReply?.value ?? null,
      deleted: {
        deleted: review.delete.deleted,
        deletedFrom: review.delete.from?.value ?? null,
        deletedBy: review.delete.performedBy?.value ?? null,
        reason: review.delete.reason?.value ?? null,
      },
      createdAt: review.createdAt.value,
      updatedAt: review.updatedAt.value,
    };
  },

  aggregateToResponseReadModel(review: ReviewAggregate): ReviewResponseReadModel {
    return {
      _id: review.id.value,
      productId: review.productId.value,
      authorName: review.authorName.value,
      authorAvatar: review.authorAvatar.value,
      rating: review.rating.value,
      title: review.title.value,
      comment: review.comment.value,
      images: review.images.map((img) => img.value),
      isVerifiedPurchase: review.isVerifiedPurchase,
      vendorReply: review.vendorReply?.value ?? null,
      likes: review.likes.value,
      dislikes: review.dislikes.value,
      createdAt: review.createdAt.value,
    };
  },
};
