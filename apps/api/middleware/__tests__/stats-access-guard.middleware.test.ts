import { describe, expect, it } from 'bun:test';
import type { Context, Next } from 'hono';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { IStatsAccessGuard } from '../statsAccessGuard';
import { createStatsAccessGuardMiddleware } from '../statsAccessGuard.middleware';

function stubGuard(
  overrides: { readable?: boolean; productError?: Error; entityError?: Error } = {},
): IStatsAccessGuard {
  const { readable = true, productError, entityError } = overrides;
  return {
    async ensureProductReadable() {
      if (productError) throw productError;
    },
    async ensureEntityReadable() {
      if (entityError) throw entityError;
      void readable;
    },
  };
}

function buildApp(options: {
  mode: 'mask' | 'throw';
  guard?: IStatsAccessGuard;
  role?: string;
  userId?: string;
}) {
  const { mode, guard, role, userId } = options;
  const app = new Hono();

  const setAuth = async (c: Context, next: Next) => {
    c.set('role', role);
    c.set('userId', userId);
    await next();
  };

  if (mode === 'throw') {
    app.get(
      '/product/:entityId/overview',
      setAuth,
      createStatsAccessGuardMiddleware({
        mode: 'throw',
        productOnly: true,
        entityIdParam: 'entityId',
        guard,
      }),
      (c: Context) => c.json({ ok: true, entityId: c.req.param('entityId') }),
    );
  } else {
    app.get(
      '/:entityType/:entityId/lifetime',
      setAuth,
      createStatsAccessGuardMiddleware({
        mode: 'mask',
        entityTypeParam: 'entityType',
        entityIdParam: 'entityId',
        guard,
      }),
      (c: Context) => c.json({ full: c.get('statsFullAccess') }),
    );
  }

  return app;
}

describe('createStatsAccessGuardMiddleware (mask mode)', () => {
  it('grants full access to admins', async () => {
    const app = buildApp({ mode: 'mask', role: 'admin' });
    const res = await app.request('/product/product-1/lifetime');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ full: true });
  });

  it('masks non product/vendor entity types', async () => {
    const app = buildApp({ mode: 'mask', role: 'seller' });
    const res = await app.request('/page/home/lifetime');
    expect(await res.json()).toEqual({ full: false });
  });

  it('shares full stats when the guard allows the owner', async () => {
    const app = buildApp({ mode: 'mask', role: 'seller', userId: 'owner-1', guard: stubGuard() });
    const res = await app.request('/vendor/vendor-1/lifetime');
    expect(await res.json()).toEqual({ full: true });
  });

  it('masks stats when the guard rejects the caller', async () => {
    const app = buildApp({
      mode: 'mask',
      role: 'seller',
      userId: 'other-1',
      guard: stubGuard({ entityError: new HTTPException(403) }),
    });
    const res = await app.request('/vendor/vendor-1/lifetime');
    expect(await res.json()).toEqual({ full: false });
  });
});

describe('createStatsAccessGuardMiddleware (throw mode)', () => {
  it('lets allowed owners reach the handler', async () => {
    const app = buildApp({ mode: 'throw', role: 'seller', userId: 'owner-1', guard: stubGuard() });
    const res = await app.request('/product/product-1/overview');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, entityId: 'product-1' });
  });

  it('propagates guard errors to the error handler', async () => {
    const app = buildApp({
      mode: 'throw',
      role: 'seller',
      userId: 'other-1',
      guard: stubGuard({ productError: new HTTPException(403, { message: 'Forbidden' }) }),
    });
    const res = await app.request('/product/product-1/overview');
    expect(res.status).toBe(403);
  });
});
