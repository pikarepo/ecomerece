import type { ReviewApplicationService } from '../review.app.service';
import type { GetReviewByIdQuery, GetReviewByIdResult } from '../queries/get-review-by-id.query';

export class GetReviewByIdHandler {
  readonly type = 'GetReviewByIdQuery';
  constructor(private readonly appService: ReviewApplicationService) {}

  async handle(query: GetReviewByIdQuery): Promise<GetReviewByIdResult> {
    return await this.appService.getReviewById(query.payload.reviewId.value);
  }
}
