import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { GetPaginatedReviewsQueryDto } from '@ecomerece/shared';
import type { ReviewApplicationService } from '../review.app.service';

export type GetPaginatedReviewsResult = Awaited<
  ReturnType<ReviewApplicationService['getPaginatedReviews']>
>;

export class GetPaginatedReviewsQuery implements IQuery<GetPaginatedReviewsResult> {
  readonly __result?: GetPaginatedReviewsResult;
  readonly type = 'GetPaginatedReviewsQuery';
  public readonly payload: { query: GetPaginatedReviewsQueryDto };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ query: GetPaginatedReviewsQueryDto }];
    this.payload = payload;
  }
}
