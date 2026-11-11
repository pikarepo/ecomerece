import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { GetAdminPaginatedCategoriesDto } from '@ecomerece/shared';
import type { CategoryAppService } from '../category.app.service';

export type GetAdminPaginatedCategoriesResult = Awaited<
  ReturnType<CategoryAppService['getAdminPaginatedCategories']>
>;

export class GetAdminPaginatedCategoriesQuery
  implements IQuery<GetAdminPaginatedCategoriesResult>
{
  readonly __result?: GetAdminPaginatedCategoriesResult;
  readonly type = 'GetAdminPaginatedCategoriesQuery';
  public readonly payload: { query: GetAdminPaginatedCategoriesDto };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ query: GetAdminPaginatedCategoriesDto }];
    this.payload = payload;
  }
}
