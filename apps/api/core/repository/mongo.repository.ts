import type {
  FilterQuery,
  InsertManyOptions,
  Model,
  MongooseBulkWriteOptions,
  QueryOptions,
  UpdateQuery,
} from 'mongoose';

import { getCurrentSession } from '../database/transaction-context';
import { BaseRepository } from './base.repository';

export type CollationOptions = {
  locale: string;
  caseLevel?: boolean;
  caseFirst?: string;
  strength?: number;
  numericOrdering?: boolean;
  alternate?: string;
  maxVariable?: string;
  backwards?: boolean;
  normalization?: boolean;
};

export class MongoRepository<T> extends BaseRepository<T> {
  constructor(protected readonly model: Model<T>) {
    super();
  }

  protected get session() {
    return getCurrentSession();
  }

  async create(data: Partial<T>) {
    const doc = new this.model(data);
    const saved = await doc.save({ session: this.session });

    return saved.toObject();
  }

  find(filter: FilterQuery<T>) {
    return this.model
      .find(filter)
      .session(this.session ?? null)
      .lean();
  }

  findOne(filter: FilterQuery<T>) {
    return this.model
      .findOne(filter)
      .session(this.session ?? null)
      .lean();
  }

  findById(id: string) {
    return this.model
      .findById(id)
      .session(this.session ?? null)
      .lean();
  }

  findByIdAndUpdate(id: string, data: UpdateQuery<T>, options: QueryOptions = { new: true }) {
    return this.model.findByIdAndUpdate(id, data, {
      ...options,
      session: this.session,
    });
  }

  findOneAndUpdate(
    filter: FilterQuery<T>,
    data: UpdateQuery<T>,
    options: QueryOptions = { new: true },
  ) {
    return this.model.findOneAndUpdate(filter, data, {
      ...options,
      session: this.session,
    });
  }

  updateOne(filter: FilterQuery<T>, data: UpdateQuery<T>) {
    return this.model.updateOne(filter, data, {
      session: this.session,
    });
  }

  updateMany(filter: FilterQuery<T>, data: UpdateQuery<T>) {
    return this.model.updateMany(filter, data, {
      session: this.session,
    });
  }

  deleteOne(filter: FilterQuery<T>) {
    return this.model.deleteOne(filter, {
      session: this.session,
    });
  }

  deleteMany(filter: FilterQuery<T>) {
    return this.model.deleteMany(filter, {
      session: this.session,
    });
  }

  findByIdAndDelete(id: string) {
    return this.model.findByIdAndDelete(id).session(this.session ?? null);
  }

  count(filter: FilterQuery<T> = {}) {
    return this.model.countDocuments(filter).session(this.session ?? null);
  }

  exists(filter: FilterQuery<T>) {
    return this.model.exists(filter).session(this.session ?? null);
  }

  async paginate(params: { filter?: FilterQuery<T>; page?: number; limit?: number }) {
    const { page, limit } = this.normalizePagination({
      page: params.page,
      limit: params.limit,
    });

    const { skip } = this.buildOffsetFilter(page, limit);

    const filter = params.filter ?? {};

    const [data, total] = await Promise.all([
      this.model
        .find(filter)
        .skip(skip)
        .limit(limit)
        .session(this.session ?? null)
        .lean(),

      this.model.countDocuments(filter).session(this.session ?? null),
    ]);

    return {
      data,
      meta: this.buildPaginationMeta(total, page, limit),
    };
  }

  async paginateByCursor(params: {
    filter?: FilterQuery<T>;
    cursor?: string;
    limit?: number;
    direction?: 'next' | 'prev';
    collation?: CollationOptions;
  }) {
    const limit = Math.max(1, Math.min(params.limit ?? 20, 100));

    const filter: FilterQuery<T> = {
      ...(params.filter ?? {}),
      ...this.buildCursorFilter(params.cursor, params.direction),
    };

    let query = this.model.find(filter);
    if (params.collation) query = query.collation(params.collation);
    const docs = await query
      .sort({ _id: -1 })
      .limit(limit + 1)
      .session(this.session ?? null)
      .lean();

    return this.buildCursorMeta(docs, limit);
  }

  async upsert(filter: FilterQuery<T>, data: Partial<T>, setOnInsert: Partial<T> = {}) {
    return this.model
      .findOneAndUpdate(
        filter,
        {
          $set: data,
          $setOnInsert: setOnInsert,
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true,
          session: this.session ?? null,
        },
      )
      .lean();
  }

  /**
   * Execute a bulk write operation with an array of write operations.
   * @param operations - Array of write operations (e.g., `{ insertOne: { document } }`, `{ updateOne: { filter, update } }`)
   * @param options - Additional bulkWrite options (e.g., `{ ordered: false }`)
   * @returns The result of the bulk write.
   */
  async bulkWrite(operations: any[], options: MongooseBulkWriteOptions = {}) {
    return this.model.bulkWrite(operations, {
      ...options,
      session: this.session ?? undefined,
    });
  }

  /**
   * Insert many documents in a single batch.
   * @param documents - Array of documents (partial objects) to insert.
   * @param options - InsertMany options (e.g., `{ ordered: false }`)
   * @returns The array of inserted documents as plain objects.
   */
  async bulkCreate(documents: Partial<T>[], options: InsertManyOptions = {}) {
    const inserted = await this.model.insertMany(documents, {
      ...options,
      session: this.session ?? undefined,
    });
    // Return plain objects (lean)
    return inserted.map((doc) => doc.toObject());
  }
}
