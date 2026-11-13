import type { ProductReadModel } from '@ecomerece/domain';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { Money } from '@ecomerece/domain/value-objects/money.vo';

/** Result of checking a product exists and may be used. */
export interface EnsureActiveProductResult {
  product: ProductReadModel | null;
  active: boolean;
}

/** Result of validating a batch of products. */
export interface VerifyProductsResult {
  validIds: Id[];
  notFoundIds: Id[];
  deletedIds: Id[];
  blockedIds: Id[];
  productReadModel: ProductReadModel[];
}

/** Cross-module read port implemented by the product module. */
export interface IProductQueries {
  ensureActiveById(productId: Id): Promise<EnsureActiveProductResult>;
  verifyAndGet(ids: Id[]): Promise<VerifyProductsResult>;
}

export interface ProductPriceRange {
  minPrice: Money;
  maxPrice: Money;
  minDiscountedPrice: Money;
  maxDiscountedPrice: Money;
}

export interface IProductStockUpdater {
  setInStock(
    productId: Id,
    inStock: boolean,
    actorId: Id,
    options?: { publish?: boolean },
  ): Promise<{ ok: boolean }>;
}

export interface IProductPricingUpdater {
  updatePrice(productId: Id, price: ProductPriceRange, actorId: Id): Promise<{ ok: boolean }>;
}

export interface ProductCategoryPair {
  id: string;
  categoryId: string;
}

export interface IProductStatsProjector {
  listVendorProductIds(vendorId: string): Promise<string[]>;
  listProductCategoryPairs(): Promise<ProductCategoryPair[]>;
  listVendorProducts(vendorId: string): Promise<ProductCategoryPair[]>;
  listProductsByCategory(categoryIds: string[]): Promise<ProductCategoryPair[]>;
  applyStats(updates: { productId: string; metrics: Record<string, number> }[]): Promise<void>;
}
