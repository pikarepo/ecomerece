import type { ProductApplicationService } from '../product.app.service';
import type {
  GetMyPaginatedProductsQuery,
  GetMyPaginatedProductsResult,
} from '../queries/get-my-paginated-products.query';

export class GetMyPaginatedProductsHandler {
  readonly type = 'GetMyPaginatedProductsQuery';
  constructor(private readonly appService: ProductApplicationService) {}

  async handle(query: GetMyPaginatedProductsQuery): Promise<GetMyPaginatedProductsResult> {
    return await this.appService.findMyPaginatedProducts(
      query.payload.query,
      query.payload.actor,
    );
  }
}
