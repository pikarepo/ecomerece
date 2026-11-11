import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { GetMyPaginatedProductsQueryDto } from '@ecomerece/shared';
import type { AuthActor } from '@ecomerece/contracts';
import type { ProductApplicationService } from '../product.app.service';

export type GetMyPaginatedProductsResult = Awaited<
  ReturnType<ProductApplicationService['findMyPaginatedProducts']>
>;

export class GetMyPaginatedProductsQuery implements IQuery<GetMyPaginatedProductsResult> {
  readonly __result?: GetMyPaginatedProductsResult;
  readonly type = 'GetMyPaginatedProductsQuery';
  public readonly payload: { query: GetMyPaginatedProductsQueryDto; actor: AuthActor };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ query: GetMyPaginatedProductsQueryDto; actor: AuthActor }];
    this.payload = payload;
  }
}
