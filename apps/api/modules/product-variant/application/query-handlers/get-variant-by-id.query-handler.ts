import type { productVariantInternalService } from '../product-varaint.internal.service';
import type {
  GetVariantByIdQuery,
  GetVariantByIdResult,
} from '../queries/get-variant-by-id.query';

export class GetVariantByIdHandler {
  readonly type = 'GetVariantByIdQuery';
  constructor(private readonly internalService: productVariantInternalService) {}

  async handle(query: GetVariantByIdQuery): Promise<GetVariantByIdResult> {
    return await this.internalService.getVariantById(query.payload.variantId);
  }
}
