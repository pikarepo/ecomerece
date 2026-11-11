import type { ProductApplicationService } from '../product.app.service';
import type {
  GetProductByIdQuery,
  GetProductByIdResult,
} from '../queries/get-product-by-id.query';

export class GetProductByIdHandler {
  readonly type = 'GetProductByIdQuery';
  constructor(private readonly appService: ProductApplicationService) {}

  async handle(query: GetProductByIdQuery): Promise<GetProductByIdResult> {
    return await this.appService.getProductById(query.payload.productId.value);
  }
}
