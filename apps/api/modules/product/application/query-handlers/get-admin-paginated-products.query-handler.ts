import type { ProductApplicationService } from '../product.app.service';
import type {
  GetAdminPaginatedProductsQuery,
  GetAdminPaginatedProductsResult,
} from '../queries/get-admin-paginated-products.query';

export class GetAdminPaginatedProductsHandler {
  readonly type = 'GetAdminPaginatedProductsQuery';
  constructor(private readonly appService: ProductApplicationService) {}

  async handle(
    query: GetAdminPaginatedProductsQuery,
  ): Promise<GetAdminPaginatedProductsResult> {
    return await this.appService.findAdminPaginatedProducts(query.payload.query);
  }
}
