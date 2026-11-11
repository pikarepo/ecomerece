import type { ProductReadModel } from '@ecomerece/domain';
import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { Money } from '@ecomerece/domain/value-objects/money.vo';

export class EnsureActiveProductGetByIdQuery
  implements IQuery<{ product: ProductReadModel | null; active: boolean }>
{
  readonly __result?: { product: ProductReadModel | null; active: boolean };
  readonly type = 'EnsureActiveProductGetByIdQuery';
  public readonly payload: { productId: Id };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ productId: Id }];
    this.payload = payload;
  }
}

export class VerifyProductAndGetQuery
  implements
    IQuery<{
      validIds: Id[];
      notFoundIds: Id[];
      deletedIds: Id[];
      blockedIds: Id[];
      productReadModel: ProductReadModel[];
    }>
{
  readonly __result?: {
    validIds: Id[];
    notFoundIds: Id[];
    deletedIds: Id[];
    blockedIds: Id[];
    productReadModel: ProductReadModel[];
  };
  readonly type = 'VerifyProductAndGetQuery';
  public readonly payload: { ids: Id[] };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ ids: Id[] }];
    this.payload = payload;
  }
}

export interface ProductPriceRange {
  minPrice: Money;
  maxPrice: Money;
  minDiscountedPrice: Money;
  maxDiscountedPrice: Money;
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
