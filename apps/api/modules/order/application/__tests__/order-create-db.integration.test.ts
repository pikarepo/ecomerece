import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  spyOn,
} from 'bun:test';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { Hono } from 'hono';
import { AddressModel } from '../../../address/infrastructure/address.models';
import { CategoryModel } from '../../../category/infrastructure/category.models';
import { InventoryModel } from '../../../inventory/infrastructure/inventory.model';
import { ProductModel } from '../../../product/infrastructure/product.model';
import { ProductVariantModel } from '../../../product-variant/infrastructure/product-variant.model';
import { UserModel } from '../../../user/infrastructure/user.models';
import { VendorModel } from '../../../vendor/infrastructure/vendor.models';
import { OrderItemsModel } from '../../../order-items/infrastructure/order-item.model';
import { OrderModel } from '../../infrastructure/order.model';

const integrationEnabled = process.env.INTEGRATION_TESTS === '1';
const runId = Id.create().value.replaceAll('-', '').slice(0, 12);

type ApiRole = 'buyer' | 'vendor' | 'admin';
type RequestOptions = { method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'; body?: unknown };
type ApiData = { message?: string; updatedData?: { id?: string } };
type ApiEnvelope<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };
type ApiResult<T> = { response: Response; body: ApiEnvelope<T> };
type OrderContext = {
  addressId: string;
  categoryId: string;
  inventoryId: string;
  productId: string;
  variantId: string;
  vendorId: string;
};

const tokens: Record<ApiRole, string> = {
  buyer: 'integration-buyer-token',
  vendor: 'integration-vendor-token',
  admin: 'integration-admin-token',
};

const userIds: Record<ApiRole, string> = {
  buyer: Id.create().value,
  vendor: Id.create().value,
  admin: Id.create().value,
};

const fakeRedis = {
  on: () => undefined,
  connect: async () => undefined,
  disconnect: async () => undefined,
  get: async () => null,
  set: async () => 'OK',
  incr: async () => 1,
  expire: async () => 1,
  eval: async () => 1,
};

const fakeSupabaseUsers: Record<string, { id: string; email: string }> = {
  [tokens.buyer]: { id: userIds.buyer, email: 'buyer@example.com' },
  [tokens.vendor]: { id: userIds.vendor, email: 'vendor@example.com' },
  [tokens.admin]: { id: userIds.admin, email: 'admin@example.com' },
};

if (integrationEnabled) {
  process.env.SUPABASE_URL ||= 'https://example.supabase.co';
  process.env.SUPABASE_SECRET_KEY ||= 'integration-test-service-role-key';
  process.env.REDIS_URL ||= 'redis://127.0.0.1:6379';
  process.env.CLOUDINARY_CLOUD_NAME ||= 'integration-test';
  process.env.CLOUDINARY_API_KEY ||= 'integration-test';
  process.env.CLOUDINARY_API_SECRET ||= 'integration-test';

  mock.module('../../../../lib/redis', () => ({ redis: fakeRedis }));
  mock.module('../../../../lib/supabase', () => ({
    supabaseAdmin: {
      auth: {
        getUser: async (token: string) => {
          const user = fakeSupabaseUsers[token];
          if (!user) return { data: { user: null }, error: new Error('Invalid token') };
          return { data: { user }, error: null };
        },
      },
    },
    getUserById: async (userId: string) => {
      const user = Object.values(fakeSupabaseUsers).find((candidate) => candidate.id === userId);
      if (!user) throw new Error(`Unknown integration user: ${userId}`);
      return user;
    },
  }));
}

let app: Hono;
let restorePublish: () => void = () => undefined;
let publishedEventTypes: string[] = [];
const createdIds: string[] = [];

function track(id: string): string {
  createdIds.push(id);
  return id;
}

function idFromMessage(message: string | undefined, label: string): string {
  if (!message) throw new Error(`Missing ${label} creation message.`);
  const match = new RegExp(`^${label} ([0-9a-f-]{36}) was`).exec(message);
  const id = match?.[1];
  if (!id) throw new Error(`Could not read ${label} id from message: ${message}`);
  return id;
}

function idFromData(data: ApiData): string {
  const id = data.updatedData?.id;
  if (!id) throw new Error('Creation response did not include an id.');
  return id;
}

function expectSuccess<T>(result: ApiResult<T>, status = 200): T {
  if (result.response.status !== status) {
    throw new Error(
      `Expected ${status}, received ${result.response.status}: ${JSON.stringify(result.body)}`,
    );
  }
  expect(result.response.status).toBe(status);
  expect(result.body.success).toBe(true);
  if (!result.body.success) throw new Error(result.body.error.message);
  return result.body.data;
}

function expectError(result: ApiResult<unknown>, status: number) {
  expect(result.response.status).toBe(status);
  expect(result.body.success).toBe(false);
  if (result.body.success) throw new Error('Expected the request to fail.');
  return result.body.error;
}

async function requestAs<T>(role: ApiRole, path: string, options: RequestOptions = {}) {
  const response = await app.request(path, {
    method: options.method ?? 'GET',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${tokens[role]}`,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const body = (await response.json()) as ApiEnvelope<T>;
  return { response, body };
}

async function seedOrderContext(options: { available: number }): Promise<OrderContext> {
  const categoryData = expectSuccess<ApiData>(
    await requestAs('admin', '/category/admin', {
      method: 'POST',
      body: {
        title: `Integration category ${runId}`,
        image: 'https://example.com/category.png',
      },
    }),
  );
  const categoryId = track(idFromMessage(categoryData.message, 'Category'));

  const vendorData = expectSuccess<ApiData>(
    await requestAs('vendor', '/vendor/me', {
      method: 'POST',
      body: {
        title: `Integration vendor ${runId}`,
        description: 'Integration test vendor used for order transaction coverage.',
        slug: `integration-vendor-${runId}`,
        contacts: {
          phone: '03000000000',
          email: `vendor-${runId}@example.com`,
          address: {
            streetAddress: '1 Integration Street',
            city: 'Lahore',
            state: 'Punjab',
            postalCode: '54000',
            country: 'Pakistan',
          },
        },
        image: {
          logo: 'https://example.com/logo.png',
          banner: 'https://example.com/banner.png',
        },
      },
    }),
  );
  const vendorId = track(idFromMessage(vendorData.message, 'Vendor'));

  expectSuccess<ApiData>(
    await requestAs('admin', '/vendor/admin/verify', {
      method: 'PATCH',
      body: { vendorId },
    }),
  );

  const productData = expectSuccess<ApiData>(
    await requestAs('vendor', '/product/vendor', {
      method: 'POST',
      body: {
        title: `Integration product ${runId}`,
        categoryId,
        appearance: 'public',
        description: 'Integration test product used for order transaction coverage.',
        ingredient: { isIngredients: false, ingredients: [] },
        disclaimer: { isDisclaimer: false, disclaimers: [] },
        image: {
          images: [
            { url: 'https://example.com/product.png', alt: 'Integration product', default: true },
          ],
        },
      },
    }),
  );
  const productId = track(idFromMessage(productData.message, 'Product'));

  const variantData = expectSuccess<ApiData>(
    await requestAs('vendor', '/product-variant/vendor', {
      method: 'POST',
      body: {
        productId,
        discountedPrice: 80,
        price: 100,
        title: `Integration variant ${runId}`,
        active: true,
      },
    }),
  );
  const variantId = track(idFromMessage(variantData.message, 'Variant'));

  const inventoryData = expectSuccess<ApiData>(
    await requestAs('admin', '/product-inventory/admin', {
      method: 'POST',
      body: {
        variantId,
        lowStockThreshold: 1,
        available: options.available,
      },
    }),
  );
  const inventoryId = track(idFromData(inventoryData));

  const addressData = expectSuccess<ApiData>(
    await requestAs('buyer', '/address/my', {
      method: 'POST',
      body: {
        streetAddress: '2 Integration Street',
        city: 'Karachi',
        state: 'Sindh',
        postalCode: '74000',
        country: 'Pakistan',
      },
    }),
  );
  const addressId = track(idFromData(addressData));

  return { addressId, categoryId, inventoryId, productId, variantId, vendorId };
}

function orderBody(context: OrderContext, idempotentKey: string, quantity: number) {
  return {
    idempotentKey,
    addressId: context.addressId,
    safeOrder: true,
    waitingTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    items: [{ variantId: context.variantId, quantity }],
  };
}

describe.skipIf(!integrationEnabled)('order creation API database integration', () => {
  beforeAll(async () => {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is required. Run this suite with `bun run test:integration`.');
    }

    const { createApplication } = await import('../../../../composition-root');
    const { createRoutes } = await import('../../../../routes/index');
    const { registerErrorHandler } = await import('../../../../errors/error-handler');
    const { InMemoryEventBus } = await import(
      '../../../../core/infrastructure/buses/in-memory-event-bus'
    );
    const { connectDB } = await import('../../../../lib/mongo');

    await connectDB();

    const publishSpy = spyOn(InMemoryEventBus.prototype, 'publish').mockImplementation(
      async (eventOrEvents) => {
        const events = Array.isArray(eventOrEvents) ? eventOrEvents : [eventOrEvents];
        publishedEventTypes.push(...events.map((event) => event.type));
      },
    );
    restorePublish = () => publishSpy.mockRestore();

    const application = createApplication();

    app = new Hono();
    app.route('/', createRoutes(application));
    registerErrorHandler(app);

    for (const role of ['buyer', 'vendor', 'admin'] as const) {
      expectSuccess(await requestAs(role, '/users/init', { method: 'POST' }), 202);
    }
    await UserModel.updateOne({ _id: userIds.admin }, { $set: { 'role.role': 'admin' } });
    await UserModel.updateOne({ _id: userIds.vendor }, { $set: { 'role.role': 'vendor' } });
  }, 30_000);

  afterEach(async () => {
    const ids = [...createdIds];
    createdIds.length = 0;
    publishedEventTypes = [];
    if (ids.length === 0) return;

    await Promise.all([
      OrderItemsModel.deleteMany({
        $or: [{ orderId: { $in: ids } }, { variantId: { $in: ids } }],
      }),
      OrderModel.deleteMany({ _id: { $in: ids } }),
      InventoryModel.deleteMany({ _id: { $in: ids } }),
      ProductVariantModel.deleteMany({ _id: { $in: ids } }),
      ProductModel.deleteMany({ _id: { $in: ids } }),
      VendorModel.deleteMany({ _id: { $in: ids } }),
      CategoryModel.deleteMany({ _id: { $in: ids } }),
      AddressModel.deleteMany({ _id: { $in: ids } }),
    ]);
  });

  afterAll(async () => {
    restorePublish();
    if (integrationEnabled) {
      await UserModel.deleteMany({ _id: { $in: Object.values(userIds) } });
      const { disconnectDB } = await import('../../../../lib/mongo');
      await disconnectDB();
    }
    mock.restore();
  });

  beforeEach(() => {
    publishedEventTypes = [];
  });

  it('creates the order, reserves inventory, and publishes order.created after commit', async () => {
    const context = await seedOrderContext({ available: 10 });
    const idempotentKey = Id.create().value;
    publishedEventTypes = [];

    const data = expectSuccess<ApiData>(
      await requestAs('buyer', '/order/my', {
        method: 'POST',
        body: orderBody(context, idempotentKey, 2),
      }),
    );
    const orderId = track(idFromData(data));

    const order = await OrderModel.findById(orderId).lean();
    expect(order?.idempotentKey).toBe(idempotentKey);
    expect(order?.buyerId).toBe(userIds.buyer);
    expect(order?.status).toBe('pending');
    expect(order?.vendorIds).toEqual([context.vendorId]);
    expect(order?.totalPrice).toBe(200);

    const items = await OrderItemsModel.find({ orderId }).lean();
    expect(items).toHaveLength(1);
    expect(items[0]?.variantId).toBe(context.variantId);
    expect(items[0]?.quantity).toBe(2);
    expect(items[0]?.totalPrice).toBe(200);
    expect(items[0]?.status).toBe('pending');
    expect(items[0]?.failureReason).toBeNull();

    const inventory = await InventoryModel.findById(context.inventoryId).lean();
    expect(inventory?.available).toBe(8);
    expect(inventory?.reserved).toBe(2);

    expect(publishedEventTypes).toContain('order.created');
  }, 30_000);

  it('rejects a duplicate idempotency key without changing stock or creating a second order', async () => {
    const context = await seedOrderContext({ available: 10 });
    const idempotentKey = Id.create().value;
    const payload = orderBody(context, idempotentKey, 2);

    const firstData = expectSuccess<ApiData>(
      await requestAs('buyer', '/order/my', { method: 'POST', body: payload }),
    );
    const orderId = track(idFromData(firstData));
    publishedEventTypes = [];

    const duplicate = await requestAs<ApiData>('buyer', '/order/my', {
      method: 'POST',
      body: payload,
    });
    const error = expectError(duplicate, 400);
    expect(error.message).toContain('same idempotency key');

    expect(await OrderModel.countDocuments({ idempotentKey })).toBe(1);
    expect(await OrderItemsModel.countDocuments({ orderId })).toBe(1);
    const inventory = await InventoryModel.findById(context.inventoryId).lean();
    expect(inventory?.available).toBe(8);
    expect(inventory?.reserved).toBe(2);
    expect(publishedEventTypes).toEqual([]);
  }, 30_000);

  it('rolls back inventory when a safe order has insufficient stock', async () => {
    const context = await seedOrderContext({ available: 1 });
    const idempotentKey = Id.create().value;
    publishedEventTypes = [];

    const rejected = await requestAs<ApiData>('buyer', '/order/my', {
      method: 'POST',
      body: orderBody(context, idempotentKey, 2),
    });
    const error = expectError(rejected, 400);
    expect(error.message.length).toBeGreaterThan(0);

    expect(await OrderModel.countDocuments({ idempotentKey })).toBe(0);
    expect(await OrderItemsModel.countDocuments({ variantId: context.variantId })).toBe(0);
    const inventory = await InventoryModel.findById(context.inventoryId).lean();
    expect(inventory?.available).toBe(1);
    expect(inventory?.reserved).toBe(0);
    expect(publishedEventTypes).toEqual([]);
  }, 30_000);
});
