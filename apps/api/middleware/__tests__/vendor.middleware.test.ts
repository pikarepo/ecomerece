import { describe, expect, it } from 'bun:test';
import type { EnsureActiveVendorResult, IVendorQueries } from '@ecomerece/contracts';
import type { VendorReadModel } from '@ecomerece/domain';
import { Hono } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { AppError } from '../../errors/app-error';
import { configureVendorQueries, vendorMiddleware } from '../vendor';

const OWNER_ID = 'user-owner-1';

function vendorRow(id: string, ownerId: string): VendorReadModel {
  return {
    id,
    ownerId,
    title: 'Corner Store',
    slug: 'corner-store',
    description: 'A storefront',
    images: { logo: '', banner: '' },
    contact: {
      phone: '000',
      email: 'vendor@example.com',
      address: { streetAddress: '', city: '', state: '', postalCode: '', country: '' },
    },
    verification: { isVerified: true, verifiedAt: null, rejectedReason: null },
    statsRefreshEnabled: false,
    isDeleted: false,
  };
}

type VendorTestEnv = { Variables: { userId?: string; vendorId?: string } };

function buildApp(options: {
  lookup: (userId: string) => EnsureActiveVendorResult;
  userId?: string;
}): { app: Hono<VendorTestEnv>; lookedUpUserIds: string[] } {
  const { lookup, userId } = options;
  const lookedUpUserIds: string[] = [];

  const queries: IVendorQueries = {
    ensureActiveByUserId: async (id) => {
      lookedUpUserIds.push(id.value);
      return lookup(id.value);
    },
    ensureActiveById: async () => ({ vendor: null, active: false }),
    getByUserId: async () => null,
  };
  configureVendorQueries(queries);

  const app = new Hono<VendorTestEnv>();
  app.onError((err, c) => {
    const status = (err instanceof AppError ? err.status : 500) as ContentfulStatusCode;
    return c.json({ success: false }, status);
  });

  app.use('*', async (c, next) => {
    if (userId) c.set('userId', userId);
    await next();
  });

  app.get('/vendor/:id', vendorMiddleware, (c) => c.json({ vendorId: c.get('vendorId') }));

  return { app, lookedUpUserIds };
}

describe('vendorMiddleware', () => {
  it('authorizes the signed-in owner of an active vendor and exposes its id', async () => {
    const { app, lookedUpUserIds } = buildApp({
      userId: OWNER_ID,
      lookup: () => ({ vendor: vendorRow('vendor-1', OWNER_ID), active: true }),
    });

    const res = await app.request('/vendor/anything');

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ vendorId: 'vendor-1' });
    expect(lookedUpUserIds).toEqual([OWNER_ID]);
  });

  it('authorizes on vendor ownership alone, without a role on the caller', async () => {
    // The credential is the user -> active vendor link; a role string such as
    // "vendor" is never required because verification promotes it separately.
    const { app } = buildApp({
      userId: OWNER_ID,
      lookup: () => ({ vendor: vendorRow('vendor-1', OWNER_ID), active: true }),
    });

    const res = await app.request('/vendor/anything');

    expect(res.status).toBe(200);
  });

  it('refuses a signed-in user who owns no vendor', async () => {
    const { app } = buildApp({
      userId: OWNER_ID,
      lookup: () => ({ vendor: null, active: false }),
    });

    const res = await app.request('/vendor/anything');

    expect(res.status).toBe(403);
  });

  it('refuses an owner whose vendor is inactive (unverified or deleted)', async () => {
    const { app } = buildApp({
      userId: OWNER_ID,
      lookup: () => ({ vendor: vendorRow('vendor-1', OWNER_ID), active: false }),
    });

    const res = await app.request('/vendor/anything');

    expect(res.status).toBe(403);
  });

  it('refuses an unauthenticated caller before reading any vendor', async () => {
    const { app, lookedUpUserIds } = buildApp({
      lookup: () => {
        throw new Error('lookup must not run without an identity');
      },
    });

    const res = await app.request('/vendor/anything');

    expect(res.status).toBe(403);
    expect(lookedUpUserIds).toEqual([]);
  });
});
