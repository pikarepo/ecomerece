import type { IProductPricingUpdater, ProductPriceRange } from '@ecomerece/contracts';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { ProductInternelService } from '../application/product.internel.service';

export class ProductPricingAdapter implements IProductPricingUpdater {
  constructor(private readonly productService: ProductInternelService) {}

  updatePrice(productId: Id, price: ProductPriceRange, actorId: Id): Promise<{ ok: boolean }> {
    return this.productService.updatePrice(productId, price, actorId);
  }
}
