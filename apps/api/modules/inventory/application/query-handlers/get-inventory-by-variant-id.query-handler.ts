import type { InventoryInternalServcie } from '../inventory.internal.service';
import type {
  GetInventoryByVariantIdQuery,
  GetInventoryByVariantIdResult,
} from '../queries/get-inventory-by-variant-id.query';

export class GetInventoryByVariantIdHandler {
  readonly type = 'GetInventoryByVariantIdQuery';
  constructor(private readonly internalService: InventoryInternalServcie) {}

  async handle(query: GetInventoryByVariantIdQuery): Promise<GetInventoryByVariantIdResult> {
    return await this.internalService.getInventoryByVariantId(query.payload.variantId);
  }
}
