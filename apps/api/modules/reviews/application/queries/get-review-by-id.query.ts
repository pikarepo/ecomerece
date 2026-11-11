import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { ReviewApplicationService } from '../review.app.service';

export type GetReviewByIdResult = Awaited<ReturnType<ReviewApplicationService['getReviewById']>>;

export class GetReviewByIdQuery implements IQuery<GetReviewByIdResult> {
  readonly __result?: GetReviewByIdResult;
  readonly type = 'GetReviewByIdQuery';
  public readonly payload: { reviewId: Id };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ reviewId: Id }];
    this.payload = payload;
  }
}
