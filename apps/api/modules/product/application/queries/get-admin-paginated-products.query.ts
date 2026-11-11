import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { GetAdminPaginatedProductsQueryDto } from '@ecomerece/shared';
import type { ProductApplicationService } from '../product.app.service';

export type GetAdminPaginatedProductsResult = Awaited<
  ReturnType<ProductApplicationService['findAdminPaginatedProducts']>
>;

export class GetAdminPaginatedProductsQuery
  implements IQuery<GetAdminPaginatedProductsResult>
{
  readonly __result?: GetAdminPaginatedProductsResult;
  readonly type = 'GetAdminPaginatedProductsQuery';
  public readonly payload: { query: GetAdminPaginatedProductsQueryDto };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ query: GetAdminPaginatedProductsQueryDto }];
    this.payload = payload;
  }
}
