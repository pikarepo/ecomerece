import type { Context, Next } from 'hono';
import { bodyLimit as honoBodyLimit } from 'hono/body-limit';
import { HTTPException } from 'hono/http-exception';

// ─── Shared Error Helper ───────────────────────────────────────────────────────
//
// Mirrors BaseController's `{ success: false, error: { code, message } }`
// shape, so a guard rejection looks identical to a controller-level error on
// the wire. Passing `res` means Hono returns this exact Response even if no
// global `app.onError` handler is registered.

type GuardStatus = 400 | 413 | 414;

function guardError(status: GuardStatus, code: string, message: string): HTTPException {
  return new HTTPException(status, {
    message,
    res: new Response(JSON.stringify({ success: false, error: { code, message } }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  });
}

// ─── 1. URL Length Guard ────────────────────────────────────────────────────────

/**
 * Rejects requests whose path + query string exceed `maxLength` characters.
 * Defends against clients/bots hammering the router with absurdly long URLs
 * to waste CPU and memory in route matching, logging, and metrics.
 *
 * @example app.use('*', urlLengthGuard(2048))
 */
export function urlLengthGuard(maxLength = 2048) {
  return async (c: Context, next: Next) => {
    const url = new URL(c.req.url);
    const requestUri = `${url.pathname}${url.search}`;
    if (requestUri.length > maxLength) {
      throw guardError(
        414,
        'URI_TOO_LONG',
        `Request URI exceeds maximum length of ${maxLength} characters`,
      );
    }
    await next();
  };
}

// ─── 2. Query String Length Guard ───────────────────────────────────────────────

/**
 * Rejects requests whose raw query string exceeds `maxLength` characters,
 * regardless of how many distinct params it's split across (a single huge
 * param value would slip past a "max number of params" check but not this).
 *
 * @example app.use('*', queryLengthGuard(1024))
 */
export function queryLengthGuard(maxLength = 1024) {
  return async (c: Context, next: Next) => {
    const { search } = new URL(c.req.url);
    const queryString = search.startsWith('?') ? search.slice(1) : search;
    if (queryString.length > maxLength) {
      throw guardError(
        414,
        'QUERY_TOO_LONG',
        `Query string exceeds maximum length of ${maxLength} characters`,
      );
    }
    await next();
  };
}

// ─── 3. Route Param Length Guard ────────────────────────────────────────────────

/**
 * Rejects requests where any matched route param (`:id`, `:slug`, etc.)
 * exceeds `maxLength` characters. Safe to mount globally — Hono resolves the
 * matched route's params before running its middleware chain, so
 * `c.req.param()` is already populated here even under `app.use('*', ...)`.
 *
 * @example app.use('*', paramLengthGuard(256))
 */
export function paramLengthGuard(maxLength = 256) {
  return async (c: Context, next: Next) => {
    const params = c.req.param();
    for (const [key, value] of Object.entries(params)) {
      if (value.length > maxLength) {
        throw guardError(
          414,
          'PARAM_TOO_LONG',
          `Route parameter "${key}" exceeds maximum length of ${maxLength} characters`,
        );
      }
    }
    await next();
  };
}

// ─── 4. Body Size Guard ─────────────────────────────────────────────────────────

/**
 * Caps request body size in bytes. Wraps Hono's built-in `bodyLimit`
 * (`hono/body-limit`) rather than reimplementing it: it trusts
 * `Content-Length` when present, and otherwise reads the stream and aborts
 * the instant the limit is crossed — tested, framework-maintained logic. We
 * only swap in a JSON error body matching BaseController's shape.
 *
 * Caveat: on platforms that fully buffer the request before your app ever
 * sees it (some Lambda/API Gateway-style integrations), there's no stream
 * left to abort early, and a forged `Content-Length` can't be cross-checked
 * by Hono itself. If you deploy there, also enforce a body size limit at the
 * platform/gateway layer.
 *
 * @example app.use('*', bodySizeGuard(1_000_000)) // 1 MB
 */
export function bodySizeGuard(maxBytes = 1_000_000) {
  return honoBodyLimit({
    maxSize: maxBytes,
    onError: () =>
      new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'PAYLOAD_TOO_LARGE',
            message: `Request body exceeds maximum size of ${maxBytes} bytes`,
          },
        }),
        { status: 413, headers: { 'Content-Type': 'application/json' } },
      ),
  });
}

// ─── 5 & 6. JSON Depth / Size Guard ─────────────────────────────────────────────

export interface JsonComplexityOptions {
  /** Max allowed nesting depth. Default 10. */
  maxDepth?: number;
  /** Max allowed total object keys + array elements, counted across the whole payload. Default 10_000. */
  maxNodes?: number;
}

type ComplexityViolation = { type: 'depth' | 'nodes'; limit: number };

/**
 * Walks a parsed JSON value to find the first complexity limit it crosses.
 * Deliberately iterative (own explicit stack) rather than recursive — a
 * recursive walker would itself be vulnerable to the exact deep-nesting
 * payload it's supposed to catch, since each recursive call adds a JS call
 * frame. Short-circuits on the first violation instead of computing an exact
 * depth/count.
 */
function findJsonComplexityViolation(
  root: unknown,
  { maxDepth = 10, maxNodes = 10_000 }: JsonComplexityOptions,
): ComplexityViolation | null {
  const stack: Array<{ value: unknown; depth: number }> = [{ value: root, depth: 0 }];
  let nodeCount = 0;

  while (stack.length > 0) {
    const { value, depth } = stack.pop()!;

    if (depth > maxDepth) {
      return { type: 'depth', limit: maxDepth };
    }

    if (value !== null && typeof value === 'object') {
      const children = Array.isArray(value)
        ? value
        : Object.values(value as Record<string, unknown>);

      nodeCount += children.length;
      if (nodeCount > maxNodes) {
        return { type: 'nodes', limit: maxNodes };
      }

      for (const child of children) {
        stack.push({ value: child, depth: depth + 1 });
      }
    }
  }

  return null;
}

/**
 * Rejects JSON bodies that are too deeply nested or contain too many total
 * keys/elements — protection against payloads that are small (or within the
 * byte limit) on the wire but expensive to traverse, clone, or validate
 * downstream (e.g. a recursive Zod schema, `JSON.stringify`, deep-equal, etc).
 *
 * Reads the body via `c.req.json()`, which Hono caches internally — calling
 * BaseController's `this.body()` / `this.safeBody()` afterwards reuses that
 * cached, already-parsed value instead of re-reading the (single-use) stream.
 *
 * Malformed JSON is *not* rejected here; it's left for downstream parsing
 * (`this.body()` / `this.safeBody()`) to report in your normal
 * validation-error shape. Note that on some runtimes, JSON that's deep
 * enough to break the runtime's own JSON parser will surface as a generic
 * parse error rather than this guard's specific message — the request is
 * still rejected, just with a less specific reason.
 *
 * @example app.use('*', jsonComplexityGuard({ maxDepth: 10, maxNodes: 10_000 }))
 */
export function jsonComplexityGuard(options: JsonComplexityOptions = {}) {
  return async (c: Context, next: Next) => {
    if (c.req.method === 'GET' || c.req.method === 'HEAD') {
      return next();
    }

    const contentType = c.req.header('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      return next();
    }

    let payload: unknown;
    try {
      payload = await c.req.json();
    } catch {
      return next(); // let downstream report malformed JSON
    }

    const violation = findJsonComplexityViolation(payload, options);
    if (violation) {
      const message =
        violation.type === 'depth'
          ? `JSON payload exceeds maximum nesting depth of ${violation.limit}`
          : `JSON payload exceeds maximum size of ${violation.limit} keys/elements`;
      throw guardError(
        413,
        violation.type === 'depth' ? 'JSON_TOO_DEEP' : 'JSON_TOO_LARGE',
        message,
      );
    }

    return next();
  };
}

// ─── Composer ────────────────────────────────────────────────────────────────

export interface RequestGuardOptions {
  maxUrlLength?: number;
  maxQueryLength?: number;
  maxParamLength?: number;
  maxBodyBytes?: number;
  maxJsonDepth?: number;
  maxJsonNodes?: number;
}

const DEFAULT_GUARD_OPTIONS: Required<RequestGuardOptions> = {
  maxUrlLength: 2048,
  maxQueryLength: 1024,
  maxParamLength: 256,
  maxBodyBytes: 1_000_000,
  maxJsonDepth: 10,
  maxJsonNodes: 10_000,
};

/**
 * Builds the full set of guards in the recommended order: cheap, string-only
 * checks first (URL/query/param), body size before any JSON parsing, JSON
 * complexity last since it depends on the body already being size-bounded.
 *
 * @example
 * app.use('*', ...requestGuards());
 *
 * @example
 * app.use('*', ...requestGuards({ maxBodyBytes: 2_000_000, maxJsonDepth: 6 }));
 */
export function requestGuards(options: RequestGuardOptions = {}) {
  const opts = { ...DEFAULT_GUARD_OPTIONS, ...options };
  return [
    urlLengthGuard(opts.maxUrlLength),
    queryLengthGuard(opts.maxQueryLength),
    paramLengthGuard(opts.maxParamLength),
    bodySizeGuard(opts.maxBodyBytes),
    jsonComplexityGuard({ maxDepth: opts.maxJsonDepth, maxNodes: opts.maxJsonNodes }),
  ];
}

// ─── Usage Example ────────────────────────────────────────────────────────────
//
// import { Hono } from 'hono';
// import { requestGuards } from './request-guard.middleware';
//
// const app = new Hono();
//
// // Apply every guard with sane defaults...
// app.use('*', ...requestGuards());
//
// // ...or tune per app:
// app.use('*', ...requestGuards({
//   maxBodyBytes: 500_000, // 500 KB
//   maxJsonDepth: 6,
//   maxJsonNodes: 2_000,
// }));
//
// // Guards already return a fully-formed JSON Response when they reject a
// // request, so no global app.onError is required for them specifically.
// // If you don't already have one for other thrown errors (e.g.
// // BaseController's `assert` / `abort`), this keeps the shape consistent:
// //
// // app.onError((err, c) => {
// //   if (err instanceof HTTPException) return err.getResponse();
// //   console.error(err);
// //   return c.json(
// //     { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' } },
// //     500,
// //   );
// // });
