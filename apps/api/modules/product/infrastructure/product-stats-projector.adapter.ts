import type { IProductStatsProjector, ProductCategoryPair } from '@ecomerece/contracts';
import { ProductModel } from './product.model';

export class ProductStatsProjector implements IProductStatsProjector {
  async listVendorProductIds(vendorId: string): Promise<string[]> {
    const docs = await ProductModel.find({ vendorId, 'deleted.deleted': false })
      .select('_id')
      .lean();
    return docs.map((doc) => String(doc._id));
  }

  async listProductCategoryPairs(): Promise<ProductCategoryPair[]> {
    const docs = await ProductModel.find({ 'deleted.deleted': false })
      .select('_id categoryId')
      .lean();
    return docs.map((doc) => ({
      id: String(doc._id),
      categoryId: String(doc.categoryId),
    }));
  }

  async listVendorProducts(vendorId: string): Promise<ProductCategoryPair[]> {
    const docs = await ProductModel.find({ vendorId, 'deleted.deleted': false })
      .select('_id categoryId')
      .lean();
    return docs.map((doc) => ({
      id: String(doc._id),
      categoryId: String(doc.categoryId),
    }));
  }

  async listProductsByCategory(categoryIds: string[]): Promise<ProductCategoryPair[]> {
    const docs = await ProductModel.find({
      categoryId: { $in: categoryIds },
      'deleted.deleted': false,
    })
      .select('_id categoryId')
      .lean();
    return docs.map((doc) => ({
      id: String(doc._id),
      categoryId: String(doc.categoryId),
    }));
  }

  async applyStats(
    updates: { productId: string; metrics: Record<string, number> }[],
  ): Promise<void> {
    if (updates.length === 0) return;

    await ProductModel.bulkWrite(
      updates.map((update) => ({
        updateOne: {
          filter: { _id: update.productId },
          update: { $set: { stats: update.metrics } },
        },
      })),
      { ordered: false },
    );
  }
}
