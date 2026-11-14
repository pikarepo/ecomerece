import type {
  IProductVariantRepository,
  ProductVariantAggregate,
  Quantity,
} from '@ecomerece/domain';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { FilterQuery } from 'mongoose';
import { MongoRepository } from '../../../core/repository/mongo.repository';
import { BadRequestError, ConcurrencyError } from '../../../errors/app-error';
import { productVariantMapper } from './product-variant.mapper';
import { ProductVariantModel, type ProductVariantPersistence } from './product-variant.model';

export class ProductVariantRepository
  extends MongoRepository<ProductVariantPersistence>
  implements IProductVariantRepository
{
  constructor() {
    super(ProductVariantModel);
  }

  async FindById(id: Id): Promise<ProductVariantAggregate | null> {
    const doc = await super.findById(id.value);
    if (!doc) return null;
    return productVariantMapper.persistenceToAggregate(doc);
  }

  async FindByIds(id: Id[]): Promise<ProductVariantAggregate[]> {
    const ids = id.map((value) => value.value);
    const filter = {
      _id: { $in: ids },
    };

    const docs = await super.find(filter);
    return docs.map((value) => productVariantMapper.persistenceToAggregate(value));
  }

  async FindActiveByProductId(id: Id): Promise<ProductVariantAggregate[] | null> {
    const doc = await super.find({ productId: id.value, active: true, 'deleted.deleted': false });
    if (!doc) return null;
    return doc.map((doc) => productVariantMapper.persistenceToAggregate(doc));
  }

  async FindByIdOrThrow(id: Id): Promise<ProductVariantAggregate> {
    const doc = await super.findById(id.value);
    if (!doc) throw new BadRequestError('Product variant not found.');
    return productVariantMapper.persistenceToAggregate(doc);
  }
  async FindByProductId(productId: Id): Promise<ProductVariantAggregate[] | null> {
    const doc = await super.find({ productId: productId.value });
    if (doc.length < 1) return null;
    const docs = doc.map((value) => productVariantMapper.persistenceToAggregate(value));
    return docs;
  }
  async EnsureOwnerShipGetByIdOrThrow(
    productId: Id,
    variantId: Id,
  ): Promise<ProductVariantAggregate> {
    const doc = await super.findOne({ productId: productId.value, _id: variantId.value });
    if (!doc) throw new BadRequestError('You do not own this product variant.');
    return productVariantMapper.persistenceToAggregate(doc);
  }
  async Save(product: ProductVariantAggregate): Promise<void> {
    const data = productVariantMapper.aggregateToPersistence(product);

    const result = await ProductVariantModel.updateOne(
      {
        _id: product.id.value,
        version: product.version.value,
      },
      {
        $set: data,
        $inc: { version: 1 },
      },
    );
    if (result.modifiedCount === 0) {
      throw new ConcurrencyError();
    }
  }

  async Delete(id: Id): Promise<void> {
    await super.findByIdAndDelete(id.value);
  }

  async Create(product: ProductVariantAggregate): Promise<void> {
    const persistantProduct = productVariantMapper.aggregateToPersistence(product);
    const productDoc = new ProductVariantModel(persistantProduct);
    await super.create(productDoc);
  }

  async Exists(id: Id): Promise<boolean> {
    return !!(await super.exists({
      _id: id.value,
    }));
  }

  async FindPaginated(params: {
    filter?: FilterQuery<ProductVariantPersistence>;
    cursor?: Id;
    limit?: Quantity;
    direction?: 'next' | 'prev';
  }): Promise<{
    data: ProductVariantAggregate[];
    meta: {
      nextCursor: string | null;
      prevCursor: string | null;
      hasMore: boolean;
    };
  }> {
    const result = await this.paginateByCursor({
      filter: params.filter,
      cursor: params.cursor?.value,
      limit: params.limit?.value,
      direction: params.direction,
    });

    const data = result.data.map((doc: ProductVariantPersistence) =>
      productVariantMapper.persistenceToAggregate(doc),
    );

    return {
      data,
      meta: result.meta,
    };
  }
}
