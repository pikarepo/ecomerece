import {
  addVendorReplyDto,
  blockReviewDto,
  createMyReviewDtoSchema,
  deleteMyReviewDto,
  type GetAdminPaginatedReviewsQueryDto,
  type GetPaginatedReviewsQueryDto,
  getAdminPaginatedReviewsQuerySchema,
  getPaginatedReviewsQuerySchema,
  reportReviewDto,
  updateMyReviewDto,
} from '@ecomerece/shared';
import type { Context } from 'hono';
import { idSchema } from '../../../../../packages/shared/dtos/id-schema';
import { BaseController } from '../../../core/controller/base.controller';
import type { ReviewApplicationService } from '../application/review.app.service';

export class ReviewController extends BaseController<ReviewApplicationService> {
  create = async (c: Context) => {
    const data = await this.body(c, createMyReviewDtoSchema);
    const actor = c.get('user');
    return this.ok(c, await this.service.createReview(data, actor));
  };

  getReviewById = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    return this.ok(c, await this.service.getReviewById(id));
  };

  getReviewsByProductId = async (c: Context) => {
    const productId = this.param(c, 'id', idSchema);
    return this.ok(c, await this.service.getReviewsByProductId(productId));
  };

  getPaginatedReviews = async (c: Context) => {
    const query: GetPaginatedReviewsQueryDto = this.query(c, getPaginatedReviewsQuerySchema);
    return this.ok(c, await this.service.getPaginatedReviews(query));
  };

  getAdminPaginatedReviews = async (c: Context) => {
    const query: GetAdminPaginatedReviewsQueryDto = this.query(
      c,
      getAdminPaginatedReviewsQuerySchema,
    );
    return this.ok(c, await this.service.findAdminPaginatedReviews(query));
  };

  updateMyReview = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const data = await this.body(c, updateMyReviewDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.updateMyReview(id, data, actor));
  };

  deleteMyReview = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const data = await this.body(c, deleteMyReviewDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.deleteMyReview(id, data, actor));
  };

  likeReview = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    return this.ok(c, await this.service.likeReview(id));
  };

  dislikeReview = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    return this.ok(c, await this.service.dislikeReview(id));
  };

  reportReview = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const data = await this.body(c, reportReviewDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.reportReview(id, data, actor));
  };

  addVendorReply = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const data = await this.body(c, addVendorReplyDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.addVendorReply(id, data, actor));
  };

  blockReview = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const data = await this.body(c, blockReviewDto);
    const actor = c.get('user');
    return this.ok(c, await this.service.blockReview(id, data, actor));
  };

  unblockReview = async (c: Context) => {
    const id = this.param(c, 'id', idSchema);
    const actor = c.get('user');
    return this.ok(c, await this.service.unblockReview(id, actor));
  };
}
