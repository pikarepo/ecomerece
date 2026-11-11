import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { GetPaginatedProductsQueryDto } from '@ecomerece/shared';
import type { ProductApplicationService } from '../product.app.service';

export type GetPublicPaginatedProductsResult = Awaited<
  ReturnType<ProductApplicationService['findPublicPaginatedProducts']>
>;

export class GetPublicPaginatedProductsQuery
  implements IQuery<GetPublicPaginatedProductsResult>
{
  readonly __result?: GetPublicPaginatedProductsResult;
  readonly type = 'GetPublicPaginatedProductsQuery';
  public readonly payload: { query: GetPaginatedProductsQueryDto };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ query: GetPaginatedProductsQueryDto }];
    this.payload = payload;
  }
}
