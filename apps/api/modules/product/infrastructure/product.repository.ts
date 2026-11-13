import type { IProductRepository, ProductAggregate, Quantity } from '@ecomerece/domain';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { FilterQuery } from 'mongoose';
import { MongoRepository } from '../../../core/repository/mongo.repository';
import { BadRequestError, ConcurrencyError, NotFoundError } from '../../../errors/app-error';
import { ProductMapper } from './product.mapper';
import { ProductModel, type ProductPersistence } from './product.model';

export class ProductRepository
  extends MongoRepository<ProductPersistence>
  implements IProductRepository {
  constructor() {
    super(ProductModel);
  }

  async FindById(id: Id): Promise<ProductAggregate | null> {
    const doc = await super.findById(id.value);

    if (!doc) return null;

    return ProductMapper.persistenceToAggregate(doc);
  }

  async FindByIds(id: Id[]): Promise<ProductAggregate[]> {
    const ids = id.map((value) => value.value);
    const products = await super.find({ _id: { $in: ids } });
    return products.map((value) => ProductMapper.persistenceToAggregate(value));
  }

  async EnsureOwnerShip(productId: Id, vendorId: Id): Promise<ProductAggregate | null> {
    const doc = await super.findOne({
      _id: productId,
      vendorId: vendorId,
    });
    if (!doc) return null;
    return ProductMapper.persistenceToAggregate(doc);
  }

  async EnsureOwnerShipOrThrow(productId: Id, vendorId: Id): Promise<ProductAggregate> {
    const doc = await super.findOne({
      _id: productId.value,
      vendorId: vendorId.value,
    });
    if (!doc) throw new BadRequestError('You do not own this product.');
    return ProductMapper.persistenceToAggregate(doc);
  }

  async FindByVendorId(id: Id): Promise<ProductAggregate | null> {
    const doc = await super.findOne({
      vendorId: id.value,
    });

    if (!doc) return null;

    return ProductMapper.persistenceToAggregate(doc);
  }

  async FindByIdOrThrow(id: Id): Promise<ProductAggregate> {
    const doc = await super.findById(id.value);

    if (!doc) {
      throw new NotFoundError('Product not found.');
    }

    return ProductMapper.persistenceToAggregate(doc);
  }

  async FindByVendorIdOrThrow(id: Id): Promise<ProductAggregate> {
    const doc = await super.findOne({
      vendorId: id.value,
    });

    if (!doc) {
      throw new NotFoundError('Product not found for this vendor.');
    }

    return ProductMapper.persistenceToAggregate(doc);
  }

  async Save(product: ProductAggregate): Promise<void> {
    const data = ProductMapper.aggregateToPersistence(product);

    const { version: _, ...updateData } = data;

    const result = await ProductModel.updateOne(
      {
        _id: product.id.value,
        version: product.version.value,
      },
      {
        $set: updateData,
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

  async Create(product: ProductAggregate): Promise<void> {
    const persistantProduct = ProductMapper.aggregateToPersistence(product);
    const productDoc = new ProductModel(persistantProduct);

    await super.create(productDoc);
  }
  async Exists(id: Id): Promise<boolean> {
    return !!(await super.exists({
      _id: id.value,
    }));
  }

  async FindPaginated(params: {
    filter?: FilterQuery<ProductPersistence>;
    cursor?: Id;
    limit?: Quantity;
    direction?: 'next' | 'prev';
  }): Promise<{
    data: ProductAggregate[];
    meta: {
      nextCursor: string | null;
      prevCursor: string | null;
      hasMore: boolean;
    };
  }> {
    const info = {
      filter: params.filter,
      cursor: params.cursor?.value,
      limit: params.limit?.value,
      direction: params.direction,
    };

    const result = await this.paginateByCursor(info);

    const aggregates = result.data.map((doc: ProductPersistence) =>
      ProductMapper.persistenceToAggregate(doc),
    );

    return {
      data: aggregates,
      meta: result.meta,
    };
  }

  private static readonly SORT_METRIC: Record<string, string> = {
    most_sold: 'quantity',
    most_views: 'views',
    most_purchases: 'purchases',
    most_revenue: 'revenue',
  };

  /**
   * Keyset pagination sorted by a denormalized stats metric (desc) tiebroken by
   * `_id` asc, or by the `_id` cursor for newest/oldest. Leaves the shared
   * `paginateByCursor` (`_id` desc) untouched.
   */
  async FindPaginatedSorted(params: {
    filter?: FilterQuery<ProductPersistence>;
    sort?: 'newest' | 'oldest' | 'most_sold' | 'most_views' | 'most_purchases' | 'most_revenue';
    cursor?: string;
    limit?: number;
    direction?: 'next' | 'prev';
  }): Promise<{
    data: ProductAggregate[];
    meta: {
      nextCursor: string | null;
      prevCursor: string | null;
      hasMore: boolean;
    };
  }> {
    const sort = params.sort ?? 'newest';
    const limit = Math.max(1, Math.min(params.limit ?? 20, 100));
    const metric = ProductRepository.SORT_METRIC[sort];
    const sortField = metric ? `stats.${metric}` : '_id';
    const dir: 1 | -1 = sort === 'oldest' ? 1 : -1;

    type Cursor = { v: string | number | null; id: string };

    const parseCursor = (raw?: string): Cursor | null => {
      if (!raw) return null;
      try {
        return JSON.parse(Buffer.from(raw, 'base64url').toString('utf-8')) as Cursor;
      } catch {
        return null;
      }
    };

    const encodeCursor = (v: Cursor['v'], id: string): string =>
      Buffer.from(JSON.stringify({ v, id })).toString('base64url');

    const baseFilter: FilterQuery<ProductPersistence> = params.filter ?? {};

    const filterFor = (
      cur: Cursor | null,
      goingForward: boolean,
    ): FilterQuery<ProductPersistence> => {
      if (!cur) return baseFilter;
      const extra = metric
        ? goingForward
          ? {
            $or: [
              { [sortField]: { $lt: cur.v! } },
              { [sortField]: cur.v!, _id: { $gt: cur.id } },
            ],
          }
          : {
            $or: [
              { [sortField]: { $gt: cur.v! } },
              { [sortField]: cur.v!, _id: { $lt: cur.id } },
            ],
          }
        : goingForward
          ? dir === -1
            ? { _id: { $lt: cur.v } }
            : { _id: { $gt: cur.v } }
          : dir === -1
            ? { _id: { $gt: cur.v } }
            : { _id: { $lt: cur.v } };
      return { ...baseFilter, ...(extra as object) } as FilterQuery<ProductPersistence>;
    };

    const forwardSort = metric
      ? ({ [sortField]: -1, _id: 1 } as Record<string, 1 | -1>)
      : { _id: dir };
    const reverseSort: Record<string, 1 | -1> = metric
      ? { [sortField]: 1, _id: -1 }
      : { _id: dir === -1 ? 1 : -1 };

    const cursor = parseCursor(params.cursor);
    const isPrev = params.direction === 'prev';

    type SortedDoc = ProductPersistence & { _id: string };
    const valueOf = (doc: SortedDoc): Cursor['v'] =>
      metric ? ((doc.stats as Record<string, number> | undefined)?.[metric] ?? 0) : doc._id;

    const fwd = (await ProductModel.find(filterFor(isPrev ? null : cursor, true))
      .sort(forwardSort)
      .limit(limit + 1)
      .lean()) as SortedDoc[];

    if (!isPrev) {
      const hasMore = fwd.length > limit;
      const page = fwd.slice(0, limit);
      const last = page[page.length - 1];
      const first = page[0];
      return {
        data: page.map((doc) => ProductMapper.persistenceToAggregate(doc)),
        meta: {
          nextCursor: last && hasMore ? encodeCursor(valueOf(last), String(last._id)) : null,
          prevCursor: first ? encodeCursor(valueOf(first), String(first._id)) : null,
          hasMore,
        },
      };
    }

    const rev = (await ProductModel.find(filterFor(cursor, false))
      .sort(reverseSort)
      .limit(limit + 1)
      .lean()) as SortedDoc[];
    const hasMore = rev.length > limit;
    const page = rev.slice(0, limit).reverse();
    const last = page[page.length - 1];
    return {
      data: page.map((doc) => ProductMapper.persistenceToAggregate(doc)),
      meta: {
        nextCursor: last && hasMore ? encodeCursor(valueOf(last), String(last._id)) : null,
        prevCursor: cursor ? encodeCursor(cursor.v, cursor.id) : null,
        hasMore,
      },
    };
  }
}
