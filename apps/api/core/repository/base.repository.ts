import mongoose, { type FilterQuery, Types } from 'mongoose';
export type PaginationInput = {
  page?: number | string;
  limit?: number | string;
};
export type CursorPaginatedResult<T> = {
  data: T[];
  meta: CursorMeta;
};
export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type PaginatedResult<T> = {
  data: T[];
  meta: PaginationMeta;
};

export type CursorMeta = {
  nextCursor: string | null;
  prevCursor: string | null;
  hasMore: boolean;
};

export abstract class BaseRepository<T> {
  protected toMongoObjectId = (id: string) => new mongoose.Types.ObjectId(id);
  // ═══════════════════════════════════════════════════════════════════════════
  //  1. PAGINATION HELPERS
  //  Cursor and offset pagination with zero-duplication.
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Sanitise page/limit from query params with safe defaults.
   * @example const { page, limit } = this.normalizePagination(req.query);
   */
  protected normalizePagination(
    input: PaginationInput,
    opts: { defaultLimit?: number; maxLimit?: number } = {},
  ): { page: number; limit: number } {
    const page = Math.max(1, Number(input.page) || 1);

    const limit = Math.max(
      1,
      Math.min(Number(input.limit) || opts.defaultLimit || 20, opts.maxLimit || 100),
    );

    return { page, limit };
  }
  /** Convert page/limit into Mongoose skip/limit. */
  protected buildOffsetFilter(page: number, limit: number): { skip: number; limit: number } {
    return { skip: (page - 1) * limit, limit };
  }

  /** Build the meta block attached to every paginated response. */
  protected buildPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
    const totalPages = Math.ceil(total / limit) || 1;
    return { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
  }

  protected toMongoIdIfPossible(id: string): Types.ObjectId | string {
    return Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : id;
  }
  /** Build a cursor filter for MongoDB. */
  protected buildCursorFilter(
    cursor?: string,
    direction: 'next' | 'prev' = 'next',
  ): FilterQuery<T> {
    if (!cursor) return {};

    const id = this.toMongoIdIfPossible(cursor);

    return {
      _id: direction === 'next' ? { $lt: id } : { $gt: id },
    } as FilterQuery<T>;
  }

  /**
   * Derive cursor metadata from a result set.
   * Fetch limit + 1 items from DB, pass them here, get hasMore + cursors back.
   */
  protected buildCursorMeta<T extends { _id: unknown }>(
    items: T[],
    limit: number,
  ): CursorPaginatedResult<T> {
    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, limit) : items;
    const lastItem = data[data.length - 1];

    return {
      data,
      meta: {
        hasMore,
        nextCursor: lastItem ? String(lastItem._id) : null,
        prevCursor: data[0] ? String(data[0]._id) : null,
      },
    };
  }
}
