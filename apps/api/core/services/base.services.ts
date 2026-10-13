import mongoose, { Types } from 'mongoose';

import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../../errors/app-error';

/** Discriminated union — replaces try/catch at call sites */
export type SafeResult<T> =
  | { ok: true; data: T; error: null }
  | { ok: false; data: null; error: Error };

// ──────────────────────────────────────────────────────────────────────────────

export abstract class BaseService {
  // ═══════════════════════════════════════════════════════════════════════════
  //  1. GUARDS & ASSERTIONS
  //  Throw the right HTTP error without cluttering every method.
  // ═══════════════════════════════════════════════════════════════════════════

  /** Throw NotFoundError when a DB lookup returns nothing. Most-used guard. */
  protected ensureFound<T>(value: T | null | undefined, message = 'Resource not found'): T {
    if (!value || value === null || value === undefined) throw new NotFoundError(message);
    return value;
  }

  /** Throw BadRequestError when a business rule is violated. */
  protected assert(condition: boolean, message = 'Bad request'): asserts condition {
    if (!condition) throw new BadRequestError(message);
  }

  /** Inverse of assert — reads naturally: throwIf(user.banned, "Account suspended") */
  protected throwIf(condition: boolean, message: string): void {
    if (condition) throw new BadRequestError(message);
  }

  /** Throw ConflictError if a duplicate is found (e.g. unique email check). */
  protected ensureNotExists(existing: unknown, message = 'Already exists'): void {
    if (existing !== null && existing !== undefined) throw new ConflictError(message);
  }

  /** Throw ForbiddenError — use for ownership / role checks. */
  protected ensurePermission(condition: boolean, message = 'Access denied'): void {
    if (!condition) throw new ForbiddenError(message);
  }

  /** Throw UnauthorizedError — use when the user is not authenticated at all. */
  protected requireAuth(value: unknown, message = 'Authentication required'): void {
    if (!value) throw new UnauthorizedError(message);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  2. VALIDATORS
  //  Normalise + validate input in one call, no repeated if-blocks.
  // ═══════════════════════════════════════════════════════════════════════════

  /** Validate and trim a required string. */
  protected requireString(value: string | null | undefined, message = 'Field is required'): string {
    if (!value || value.trim().length === 0) throw new BadRequestError(message);
    return value.trim();
  }

  /** Validate a required number, with optional inclusive min/max. */
  protected requireNumber(
    value: number | string | null | undefined,
    message = 'Valid number required',
    opts?: { min?: number; max?: number },
  ): number {
    const n = Number(value);
    if (value === null || value === undefined || isNaN(n)) throw new BadRequestError(message);
    if (opts?.min !== undefined && n < opts.min)
      throw new BadRequestError(`Value must be ≥ ${opts.min}`);
    if (opts?.max !== undefined && n > opts.max)
      throw new BadRequestError(`Value must be ≤ ${opts.max}`);
    return n;
  }

  /** Validate a non-empty array. */
  protected requireArray<T>(value: T[] | null | undefined, message = 'Array cannot be empty'): T[] {
    if (!value || value.length === 0) throw new BadRequestError(message);
    return value;
  }

  /**
   * Validate an enum value.
   * @example requireEnum(status, ["active","inactive"] as const)
   */
  protected requireEnum<T extends string>(
    value: string | null | undefined,
    allowed: readonly T[],
    message?: string,
  ): T {
    if (!value || !allowed.includes(value as T))
      throw new BadRequestError(message ?? `Must be one of: ${allowed.join(', ')}`);
    return value as T;
  }

  /** Validate and return a MongoDB ObjectId string. */
  protected requireObjectId(
    value: string | null | undefined,
    message = 'Invalid ID format',
  ): string {
    if (!value || !mongoose.Types.ObjectId.isValid(value)) throw new BadRequestError(message);
    return value;
  }

  /** Validate an email address and return it lowercase. */
  protected requireEmail(
    value: string | null | undefined,
    message = 'Valid email required',
  ): string {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value || !emailRe.test(value)) throw new BadRequestError(message);
    return value.toLowerCase().trim();
  }

  /** Parse and validate a date from a string, number, or Date. */
  protected requireDate(
    value: string | number | Date | null | undefined,
    message = 'Valid date required',
  ): Date {
    if (!value) throw new BadRequestError(message);
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) throw new BadRequestError(message);
    return d;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  3. ASYNC HELPERS
  //  Reduce boilerplate around try/catch, retries, timeouts, parallelism.
  // ═══════════════════════════════════════════════════════════════════════════

  /** Wrap a promise — re-throws with a clean message on failure. */
  protected async safe<T>(fn: () => Promise<T>, fallbackMessage = 'Operation failed'): Promise<T> {
    try {
      return await fn();
    } catch (err: any) {
      throw new Error(err?.message ?? fallbackMessage);
    }
  }

  /** Same as `safe` but returns null instead of throwing. Great for optional lookups. */
  protected async safeNull<T>(fn: () => Promise<T>): Promise<T | null> {
    try {
      return await fn();
    } catch {
      return null;
    }
  }

  /**
   * Returns a discriminated union instead of throwing — removes try/catch at call sites.
   * @example
   *   const result = await this.safeResult(() => UserModel.findById(id));
   *   if (!result.ok) return handleError(result.error);
   *   doSomething(result.data);
   */
  protected async safeResult<T>(fn: () => Promise<T>): Promise<SafeResult<T>> {
    try {
      const data = await fn();
      return { ok: true, data, error: null };
    } catch (err: any) {
      return { ok: false, data: null, error: err };
    }
  }

  /**
   * Retry with exponential backoff.
   * @example this.retry(() => externalApi.call(), { attempts: 3, delayMs: 500 })
   */
  protected async retry<T>(
    fn: () => Promise<T>,
    opts: { attempts?: number; delayMs?: number; backoff?: number } = {},
  ): Promise<T> {
    const { attempts = 3, delayMs = 300, backoff = 2 } = opts;
    let lastErr: unknown;
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (err) {
        lastErr = err;
        if (i < attempts - 1) await this.sleep(delayMs * backoff ** i);
      }
    }
    throw lastErr;
  }

  /** Race a promise against a timeout. */
  protected async withTimeout<T>(fn: () => Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms),
      ),
    ]);
  }

  /** Run an array of async functions in parallel. */
  protected async parallel<T>(fns: Array<() => Promise<T>>): Promise<T[]> {
    return Promise.all(fns.map((f) => f()));
  }

  /**
   * Fire-and-forget — runs async work without blocking the response.
   * Logs errors silently. Perfect for notifications, audit logs, cache invalidation.
   */
  protected runAfter(fn: () => Promise<void>): void {
    fn().catch((err) => console.error('[runAfter]', err?.message));
  }

  /** Promise-based sleep. */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  4. OBJECT HELPERS
  //  Clean, shape, and merge plain objects without lodash.
  // ═══════════════════════════════════════════════════════════════════════════
  protected toMongoObjectId = (id: string) => new mongoose.Types.ObjectId(id);
  protected convertObjectIds = <T extends Record<string, unknown>>(
    payload: T,
    fields: readonly string[],
  ): T => {
    const traverse = (value: unknown): void => {
      if (Array.isArray(value)) {
        value.forEach(traverse);
        return;
      }

      if (value === null || typeof value !== 'object' || value instanceof Types.ObjectId) {
        return;
      }

      const obj = value as Record<string, unknown>;

      for (const [key, fieldValue] of Object.entries(obj)) {
        if (fields.includes(key)) {
          if (typeof fieldValue === 'string' && Types.ObjectId.isValid(fieldValue)) {
            obj[key] = new Types.ObjectId(fieldValue);
          } else if (Array.isArray(fieldValue)) {
            obj[key] = fieldValue.map((item) =>
              typeof item === 'string' && Types.ObjectId.isValid(item)
                ? new Types.ObjectId(item)
                : item,
            );
          }
        }

        traverse(obj[key]);
      }
    };

    traverse(payload);

    return payload;
  };
  /** Strip `undefined` keys — safe to spread into Mongoose update calls. */
  protected cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
    const out: any = {};
    for (const key of Object.keys(obj)) {
      if (obj[key] !== undefined) out[key] = obj[key];
    }
    return out;
  }

  /** Recursively strip both `undefined` and `null` keys. */
  protected deepClean<T extends Record<string, any>>(obj: T): Partial<T> {
    const out: any = {};
    for (const key of Object.keys(obj)) {
      const v = obj[key];
      if (v === undefined || v === null) continue;
      out[key] =
        typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date) ? this.deepClean(v) : v;
    }
    return out;
  }

  /** Pick specific keys from an object (typed). */
  protected pick<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    for (const k of keys) if (k in obj) result[k] = obj[k];
    return result;
  }

  /** Omit specific keys from an object (typed). */
  protected omit<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    const result = { ...obj };
    for (const k of keys) delete (result as any)[k];
    return result as Omit<T, K>;
  }

  /** Merge input over defaults, ignoring undefined values in input. */
  protected mergeDefaults<T extends Record<string, any>>(input: Partial<T>, defaults: T): T {
    return { ...defaults, ...this.cleanObject(input) };
  }

  /** Group an array by a key — returns a Record<key, items[]>. */
  protected groupBy<T>(items: T[], key: keyof T): Record<string, T[]> {
    return items.reduce(
      (acc, item) => {
        const k = String(item[key]);
        (acc[k] ??= []).push(item);
        return acc;
      },
      {} as Record<string, T[]>,
    );
  }

  /** Split an array into fixed-size chunks — useful for batch DB writes. */
  protected chunk<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  }

  /** Deduplicate an array of primitives. */
  protected unique<T>(arr: T[]): T[] {
    return [...new Set(arr)];
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  5. DATE HELPERS
  //  All date math in one place — no more inline `new Date()` arithmetic.
  // ═══════════════════════════════════════════════════════════════════════════

  protected now(): Date {
    return new Date();
  }

  protected addMinutes(minutes: number, from = new Date()): Date {
    return new Date(from.getTime() + minutes * 60_000);
  }

  protected addHours(hours: number, from = new Date()): Date {
    return new Date(from.getTime() + hours * 3_600_000);
  }

  protected addDays(days: number, from = new Date()): Date {
    const d = new Date(from);
    d.setDate(d.getDate() + days);
    return d;
  }

  /** Check whether a date (e.g. token expiry) has already passed. */
  protected isExpired(date: Date): boolean {
    return Date.now() > date.getTime();
  }

  /** Build a { start, end } range spanning the last N days (useful for analytics). */
  protected toDateRange(days: number): { start: Date; end: Date } {
    const end = new Date();
    return { start: this.addDays(-days, end), end };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  6. STRING / FORMAT HELPERS
  //  Common string transforms that appear everywhere in backend code.
  // ═══════════════════════════════════════════════════════════════════════════

  /** Generate a URL-friendly slug. */
  protected toSlug(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Mask all but the last N characters — safe for logging tokens / card numbers.
   * @example this.mask("sk-abc123", 4) → "****123"
   */
  protected mask(str: string, visibleChars = 4): string {
    if (!str || str.length <= visibleChars) return '****';
    return '*'.repeat(str.length - visibleChars) + str.slice(-visibleChars);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  7. CONTROL FLOW HELPERS
  //  Small utilities that make conditional logic read like plain English.
  // ═══════════════════════════════════════════════════════════════════════════

  /** Run a callback only when condition is true. */
  protected when(condition: boolean, fn: () => void): void {
    if (condition) fn();
  }

  /** Return a value when condition is true; undefined otherwise. */
  protected returnIf<T>(condition: boolean, value: T): T | undefined {
    return condition ? value : undefined;
  }

  /**
   * Return the first non-null/undefined value — replaces nested `?? ?? ??`.
   * @example this.coalesce(user.nickname, user.name, "Anonymous")
   */
  protected coalesce<T>(...values: Array<T | null | undefined>): T | undefined {
    return values.find((v) => v !== null && v !== undefined) as T | undefined;
  }
}
