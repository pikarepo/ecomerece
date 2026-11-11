import type { ReviewApplicationService } from '../review.app.service';
import type {
  GetPaginatedReviewsQuery,
  GetPaginatedReviewsResult,
} from '../queries/get-paginated-reviews.query';

export class GetPaginatedReviewsHandler {
  readonly type = 'GetPaginatedReviewsQuery';
  constructor(private readonly appService: ReviewApplicationService) {}

  async handle(query: GetPaginatedReviewsQuery): Promise<GetPaginatedReviewsResult> {
    return await this.appService.getPaginatedReviews(query.payload.query);
  }
}
