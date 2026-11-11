import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { GetAdminPaginatedReviewsQueryDto } from '@ecomerece/shared';
import type { ReviewApplicationService } from '../review.app.service';

export type GetAdminPaginatedReviewsResult = Awaited<
  ReturnType<ReviewApplicationService['findAdminPaginatedReviews']>
>;

export class GetAdminPaginatedReviewsQuery
  implements IQuery<GetAdminPaginatedReviewsResult>
{
  readonly __result?: GetAdminPaginatedReviewsResult;
  readonly type = 'GetAdminPaginatedReviewsQuery';
  public readonly payload: { query: GetAdminPaginatedReviewsQueryDto };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ query: GetAdminPaginatedReviewsQueryDto }];
    this.payload = payload;
  }
}
