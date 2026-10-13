import {
  createMyReviewDtoSchema,
  type GetAdminPaginatedReviewsQueryDto,
  type GetPaginatedReviewsQueryDto,
  getAdminPaginatedReviewsQuerySchema,
  getPaginatedReviewsQuerySchema,
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
}
