import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { getPaginatedDtoType } from '@ecomerece/shared';
import type { CategoryAppService } from '../category.app.service';

export type GetPaginatedCategoriesResult = Awaited<
  ReturnType<CategoryAppService['getPaginatedCategories']>
>;

export class GetPaginatedCategoriesQuery implements IQuery<GetPaginatedCategoriesResult> {
  readonly __result?: GetPaginatedCategoriesResult;
  readonly type = 'GetPaginatedCategoriesQuery';
  public readonly payload: { query: getPaginatedDtoType };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ query: getPaginatedDtoType }];
    this.payload = payload;
  }
}
