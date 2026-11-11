import type { productVariantApplicationService } from '../product-variant.app.service';
import type {
  GetAdminPaginatedVariantsQuery,
  GetAdminPaginatedVariantsResult,
} from '../queries/get-admin-paginated-variants.query';

export class GetAdminPaginatedVariantsHandler {
  readonly type = 'GetAdminPaginatedVariantsQuery';
  constructor(private readonly appService: productVariantApplicationService) {}

  async handle(
    query: GetAdminPaginatedVariantsQuery,
  ): Promise<GetAdminPaginatedVariantsResult> {
    return await this.appService.findAdminPaginatedVariants(query.payload.query);
  }
}
