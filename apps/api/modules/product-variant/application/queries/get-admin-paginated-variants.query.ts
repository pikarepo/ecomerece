import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { GetAdminPaginatedVariantsQueryDto } from '@ecomerece/shared';
import type { productVariantApplicationService } from '../product-variant.app.service';

export type GetAdminPaginatedVariantsResult = Awaited<
  ReturnType<productVariantApplicationService['findAdminPaginatedVariants']>
>;

export class GetAdminPaginatedVariantsQuery
  implements IQuery<GetAdminPaginatedVariantsResult>
{
  readonly __result?: GetAdminPaginatedVariantsResult;
  readonly type = 'GetAdminPaginatedVariantsQuery';
  public readonly payload: { query: GetAdminPaginatedVariantsQueryDto };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ query: GetAdminPaginatedVariantsQueryDto }];
    this.payload = payload;
  }
}
