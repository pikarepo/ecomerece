import type { ProductVariantReadModel } from '@ecomerece/domain';
import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';

export class VerifyVariantsAndGetQuery
  implements
    IQuery<{
      validIds: Id[];
      notFoundIds: Id[];
      deletedIds: Id[];
      nonActiveIds: Id[];
      variantReadModel: ProductVariantReadModel[];
    }>
{
  readonly __result?: {
    validIds: Id[];
    notFoundIds: Id[];
    deletedIds: Id[];
    nonActiveIds: Id[];
    variantReadModel: ProductVariantReadModel[];
  };
  readonly type = 'VerifyVariantsAndGetQuery';
  public readonly payload: { ids: Id[] };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ ids: Id[] }];
    this.payload = payload;
  }
}
