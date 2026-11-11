import type { ReviewApplicationService } from '../review.app.service';
import type {
  GetAdminPaginatedReviewsQuery,
  GetAdminPaginatedReviewsResult,
} from '../queries/get-admin-paginated-reviews.query';

export class GetAdminPaginatedReviewsHandler {
  readonly type = 'GetAdminPaginatedReviewsQuery';
  constructor(private readonly appService: ReviewApplicationService) {}

  async handle(
    query: GetAdminPaginatedReviewsQuery,
  ): Promise<GetAdminPaginatedReviewsResult> {
    return await this.appService.findAdminPaginatedReviews(query.payload.query);
  }
}
