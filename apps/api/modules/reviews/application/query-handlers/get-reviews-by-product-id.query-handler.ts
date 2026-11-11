import type { ReviewApplicationService } from '../review.app.service';
import type {
  GetReviewsByProductIdQuery,
  GetReviewsByProductIdResult,
} from '../queries/get-reviews-by-product-id.query';

export class GetReviewsByProductIdHandler {
  readonly type = 'GetReviewsByProductIdQuery';
  constructor(private readonly appService: ReviewApplicationService) {}

  async handle(query: GetReviewsByProductIdQuery): Promise<GetReviewsByProductIdResult> {
    return await this.appService.getReviewsByProductId(query.payload.productId.value);
  }
}
