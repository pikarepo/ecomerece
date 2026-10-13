import type { Context } from 'hono';
import { getCookie } from 'hono/cookie';
import { HTTPException } from 'hono/http-exception';
import type { ZodSchema } from 'zod';

// ─── Shared Types ─────────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export type SafeResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string[]> };

export type HttpErrorStatus = 400 | 401 | 403 | 404 | 409 | 422 | 500;

// ─── Base Controller ──────────────────────────────────────────────────────────

export abstract class BaseController<TService> {
  constructor(protected readonly service: TService) {}

  // ── 2xx Success ─────────────────────────────────────────────────────────────
  //backend
  /** 200 – general success with a data payload */
  protected ok(c: Context, data: unknown) {
    return c.json({ success: true, data });
  }

  /** 201 – resource created */
  protected created(c: Context, data: unknown) {
    return c.json({ success: true, data }, 201);
  }

  /** 202 – request accepted, processing async */
  protected accepted(c: Context, data?: unknown) {
    return c.json({ success: true, data }, 202);
  }

  /** 204 – success with no body (e.g. DELETE) */
  protected noContent(c: Context) {
    return c.body(null, 204);
  }

  /** 200 – paginated list with meta */
  protected paginated(c: Context, data: unknown, meta: PaginationMeta) {
    return c.json({ success: true, data, meta });
  }

  // ── 3xx Redirect ─────────────────────────────────────────────────────────────

  protected redirect(c: Context, url: string, status: 301 | 302 | 307 | 308 = 302) {
    return c.redirect(url, status);
  }

  // ── 4xx / 5xx Errors ─────────────────────────────────────────────────────────

  /** 400 – malformed input */
  protected badRequest(c: Context, message = 'Bad request', details?: unknown) {
    return c.json({ success: false, error: { code: 'BAD_REQUEST', message, details } }, 400);
  }

  /** 401 – missing / invalid credentials */
  protected unauthorized(c: Context, message = 'Unauthorized') {
    return c.json({ success: false, error: { code: 'UNAUTHORIZED', message } }, 401);
  }

  /** 403 – authenticated but not allowed */
  protected forbidden(c: Context, message = 'Forbidden') {
    return c.json({ success: false, error: { code: 'FORBIDDEN', message } }, 403);
  }

  /** 404 – resource not found */
  protected notFound(c: Context, message = 'Resource not found') {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message } }, 404);
  }

  /** 409 – state conflict (duplicate, version mismatch, etc.) */
  protected conflict(c: Context, message = 'Conflict') {
    return c.json({ success: false, error: { code: 'CONFLICT', message } }, 409);
  }

  /** 422 – body valid JSON, but fails business/schema validation */
  protected unprocessable(c: Context, errors: Record<string, string[]>) {
    return c.json(
      {
        success: false,
        error: { code: 'UNPROCESSABLE_ENTITY', message: 'Validation failed', errors },
      },
      422,
    );
  }

  /** 500 – unexpected server error */
  protected serverError(c: Context, message = 'Internal server error') {
    return c.json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message } }, 500);
  }

  // ── Input Parsing ─────────────────────────────────────────────────────────────

  /**
   * Parse JSON body — throws ZodError on failure (let a global error handler catch it).
   */
  protected async body<T>(c: Context, schema: ZodSchema<T>): Promise<T> {
    return schema.parse(await c.req.json());
  }

  /**
   * Parse a single route param.
   *
   * @example
   * const id = this.param(c, 'id', z.coerce.number().int().positive());
   */
  protected param<T>(c: Context, key: string, schema: ZodSchema<T>): T {
    return schema.parse(c.req.param(key));
  }

  /**
   * Parse all query-string params at once.
   *
   * @example
   * const { page, limit } = this.query(c, z.object({
   *   page: z.coerce.number().default(1),
   *   limit: z.coerce.number().max(100).default(20),
   * }));
   */
  protected query<T>(c: Context, schema: ZodSchema<T>): T {
    return schema.parse(c.req.query());
  }

  /** Read a typed value from `c.set('user', …)` (set by auth middleware) */
  protected user<T>(c: Context, schema: ZodSchema<T>): T {
    return schema.parse(c.get('user'));
  }

  /** Read a single request header */
  protected header(c: Context, key: string): string | undefined {
    return c.req.header(key);
  }

  /** Read a single cookie (requires Hono cookie middleware) */
  protected cookie(c: Context, key: string): string | undefined {
    return getCookie(c, key);
  }

  /**
   * Extract the token from an `Authorization: Bearer <token>` header.
   *
   * @example
   * const token = this.bearerToken(c);
   * if (!token) return this.unauthorized(c);
   */
  protected bearerToken(c: Context): string | undefined {
    const auth = c.req.header('Authorization');
    return auth?.startsWith('Bearer ') ? auth.slice(7) : undefined;
  }

  // ── Guards ───────────────────────────────────────────────────────────────────

  /**
   * Assert a condition — throws an `HTTPException` if falsy.
   * Hono's built-in error handler or your global handler catches it.
   *
   * @example
   * const user = await this.service.findById(id);
   * this.assert(!!user, 'User not found', 404);
   * // user is narrowed to truthy here
   */
  protected assert(
    condition: boolean,
    message: string,
    status: HttpErrorStatus = 400,
  ): asserts condition {
    if (!condition) throw new HTTPException(status, { message });
  }

  /**
   * Throw an `HTTPException` unconditionally (useful in switch-default or unreachable branches).
   *
   * @example
   * throw this.abort('Payment gateway timeout', 503);
   */
  protected abort(message: string, status: HttpErrorStatus = 500): never {
    throw new HTTPException(status, { message });
  }

  // ── Utilities ─────────────────────────────────────────────────────────────────

  /**
   * Build a consistent `PaginationMeta` object from raw values.
   *
   * @example
   * const meta = this.paginationOf(page, limit, totalCount);
   * return this.paginated(c, rows, meta);
   */
  protected paginationOf(page: number, limit: number, total: number): PaginationMeta {
    const totalPages = Math.ceil(total / limit);
    return {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  /**
   * Set multiple response headers in a single call.
   *
   * @example
   * this.setHeaders(c, { 'X-Request-Id': reqId, 'X-Api-Version': '2' });
   */
  protected setHeaders(c: Context, headers: Record<string, string>): void {
    for (const [key, value] of Object.entries(headers)) {
      c.header(key, value);
    }
  }

  /**
   * Add a public `Cache-Control` header.
   *
   * @example
   * this.cache(c, 60);        // cache 1 minute
   * return this.ok(c, data);
   */
  protected cache(c: Context, maxAgeSeconds: number): void {
    c.header('Cache-Control', `public, max-age=${maxAgeSeconds}`);
  }

  /** Prevent the response from being cached. */
  protected noCache(c: Context): void {
    c.header('Cache-Control', 'no-store, no-cache, must-revalidate');
  }
}

// ─── Usage Example ────────────────────────────────────────────────────────────
//
// import { z } from 'zod';
// import { BaseController } from './base.controller';
// import type { UserService } from '../services/user.service';
//
// const CreateUserSchema = z.object({
//   name:  z.string().min(1),
//   email: z.string().email(),
// });
//
// const ListQuerySchema = z.object({
//   page:  z.coerce.number().int().positive().default(1),
//   limit: z.coerce.number().int().max(100).default(20),
// });
//
// export class UserController extends BaseController<UserService> {
//
//   list = async (c: Context) => {
//     const { page, limit } = this.query(c, ListQuerySchema);
//     const [users, total] = await this.service.findAll({ page, limit });
//     this.cache(c, 30);
//     return this.paginated(c, users, this.paginationOf(page, limit, total));
//   };
//
//   create = async (c: Context) => {
//     const result = await this.safeBody(c, CreateUserSchema);
//     if (!result.success) return this.unprocessable(c, result.errors);
//
//     const existing = await this.service.findByEmail(result.data.email);
//     this.assert(!existing, 'Email already in use', 409);
//
//     const user = await this.service.create(result.data);
//     return this.created(c, user);
//   };
//
//   remove = async (c: Context) => {
//     const id = this.param(c, 'id', z.coerce.number().int().positive());
//     const user = await this.service.findById(id);
//     this.assert(!!user, 'User not found', 404);
//     await this.service.delete(id);
//     return this.noContent(c);
//   };
// }
