import type { productVariantApplicationService } from '../product-variant.app.service';
import type {
  GetVariantsByProductIdQuery,
  GetVariantsByProductIdResult,
} from '../queries/get-variants-by-product-id.query';

export class GetVariantsByProductIdHandler {
  readonly type = 'GetVariantsByProductIdQuery';
  constructor(private readonly appService: productVariantApplicationService) {}

  async handle(
    query: GetVariantsByProductIdQuery,
  ): Promise<GetVariantsByProductIdResult> {
    return await this.appService.getVarientsByProductId(query.payload.productId.value);
  }
}
