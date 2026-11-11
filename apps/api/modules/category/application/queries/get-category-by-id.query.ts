import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { CategoryAppService } from '../category.app.service';

export type GetCategoryByIdResult = Awaited<ReturnType<CategoryAppService['getCategoryById']>>;

export class GetCategoryByIdQuery implements IQuery<GetCategoryByIdResult> {
  readonly __result?: GetCategoryByIdResult;
  readonly type = 'GetCategoryByIdQuery';
  public readonly payload: { id: Id };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ id: Id }];
    this.payload = payload;
  }
}
