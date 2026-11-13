import type { Money, ProductReadModel } from '@ecomerece/domain';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import { BaseService } from '../../../core/services/base.services';
import { ProductMapper } from '../infrastructure/product.mapper';
import type { ProductRepository } from '../infrastructure/product.repository';

export class ProductInternelService extends BaseService {
  constructor(private readonly productRepo: ProductRepository) {
    super();
  }

  async ensureActiveProductGetById(
    productId: Id,
  ): Promise<{ product: ProductReadModel | null; active: boolean }> {
    const product = await this.productRepo.FindById(productId);
    if (!product) return { product: null, active: false };
    const ProductReadModel = ProductMapper.aggregateToReadModel(product);
    if (product.block.isBlocked || product.delete.isDeleted)
      return { product: ProductReadModel, active: false };
    return { product: ProductReadModel, active: true };
  }

  async verifyProductAndGet(ids: Id[]): Promise<{
    validIds: Id[];
    notFoundIds: Id[];
    deletedIds: Id[];
    blockedIds: Id[];
    productReadModel: ProductReadModel[];
  }> {
    const products = await this.productRepo.FindByIds(ids);
    const validProducts = products.filter((p) => !p.delete.deleted && !p.block.blocked);
    const validIdValues = new Set(validProducts.map((p) => p.id.value));
    const existingProductIds = new Set(products.map((p) => p.id.value));
    const foundIds = ids.filter((id) => existingProductIds.has(id.value));
    const notFoundIds = ids.filter((id) => !existingProductIds.has(id.value));
    const deletedIds = products.filter((p) => p.delete.deleted).map((p) => p.id);
    const blockedIds = products.filter((p) => p.block.blocked).map((p) => p.id);
    const validIds = foundIds.filter((id) => validIdValues.has(id.value));
    const productReadModel = validProducts.map((p) => ProductMapper.aggregateToReadModel(p));
    return {
      validIds,
      notFoundIds,
      deletedIds,
      blockedIds,
      productReadModel,
    };
  }

  async updatePrice(
    productId: Id,
    price: {
      minPrice: Money;
      maxPrice: Money;
      minDiscountedPrice: Money;
      maxDiscountedPrice: Money;
    },
    actorId: Id,
  ): Promise<{ ok: boolean }> {
    const product = await this.productRepo.FindById(productId);
    if (!product) return { ok: false };
    product.updatePricingSummary(
      price.minPrice,
      price.maxPrice,
      price.minDiscountedPrice,
      price.maxDiscountedPrice,
      actorId,
    );
    await this.productRepo.Save(product).catch(() => {
      return { ok: false };
    });

    return { ok: true };
  }
}
