import type { ProductApplicationService } from '../product.app.service';
import type {
  GetPublicPaginatedProductsQuery,
  GetPublicPaginatedProductsResult,
} from '../queries/get-public-paginated-products.query';

export class GetPublicPaginatedProductsHandler {
  readonly type = 'GetPublicPaginatedProductsQuery';
  constructor(private readonly appService: ProductApplicationService) {}

  async handle(
    query: GetPublicPaginatedProductsQuery,
  ): Promise<GetPublicPaginatedProductsResult> {
    return await this.appService.findPublicPaginatedProducts(query.payload.query);
  }
}
