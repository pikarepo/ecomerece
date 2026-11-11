import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { ReviewApplicationService } from '../review.app.service';

export type GetReviewsByProductIdResult = Awaited<
  ReturnType<ReviewApplicationService['getReviewsByProductId']>
>;

export class GetReviewsByProductIdQuery implements IQuery<GetReviewsByProductIdResult> {
  readonly __result?: GetReviewsByProductIdResult;
  readonly type = 'GetReviewsByProductIdQuery';
  public readonly payload: { productId: Id };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ productId: Id }];
    this.payload = payload;
  }
}
