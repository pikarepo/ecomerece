import type { IEvent } from '@ecomerece/domain/events/event-bus.interface';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { mock, expect, spyOn } from 'bun:test';
import { Hono } from 'hono';
import type { InMemoryEventBus } from '../core/infrastructure/buses/in-memory-event-bus';
import { AddressModel } from '../modules/address/infrastructure/address.models';
import { CartModel } from '../modules/cart/infrastructure/cart.model';
import { CategoryModel } from '../modules/category/infrastructure/category.models';
import { HomeModel } from '../modules/home/infrastructure/home.models';
import { InventoryModel } from '../modules/inventory/infrastructure/inventory.model';
import { NotificationModel } from '../modules/notifications/infrastructure/notification.model';
import { OrderRequestModel } from '../modules/order-request/infrastructure/order-request.model';
import { OrderItemsModel } from '../modules/order-items/infrastructure/order-item.model';
import { OrderModel } from '../modules/order/infrastructure/order.model';
import { PaymentModel } from '../modules/payments/infrastructure/payment.model';
import { LedgerEntryModel, PayoutModel } from '../modules/payouts/infrastructure/payout.model';
import { ProductVariantModel } from '../modules/product-variant/infrastructure/product-variant.model';
import { ProductModel } from '../modules/product/infrastructure/product.model';
import {
  CouponModel,
  CouponRedemptionModel,
} from '../modules/promotions/infrastructure/coupon.model';
import { ReturnModel } from '../modules/returns/infrastructure/return.model';
import { ReviewModel } from '../modules/reviews/infrastructure/review.model';
import { ShipmentModel } from '../modules/shipping/infrastructure/shipment.model';
import { UserModel } from '../modules/user/infrastructure/user.models';
import { VendorModel } from '../modules/vendor/infrastructure/vendor.models';

export const integrationEnabled = process.env.INTEGRATION_TESTS === '1';
export const runId = Id.create().value.replaceAll('-', '').slice(0, 12);

export type ApiRole = 'buyer' | 'vendor' | 'admin';
export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
};
export type ApiData = {
  message?: string;
  updatedData?: { id?: string };
};
export type ApiEnvelope<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };
export type ApiResult<T> = { response: Response; body: ApiEnvelope<T> };
export type CatalogContext = {
  addressId: string;
  categoryId: string;
  inventoryId: string;
  productId: string;
  variantId: string;
  vendorId: string;
};
export type OrderContext = CatalogContext & {
  idempotentKey: string;
  itemId: string;
  orderId: string;
};

export const tokens: Record<ApiRole, string> = {
  buyer: 'integration-buyer-token',
  vendor: 'integration-vendor-token',
  admin: 'integration-admin-token',
};

export const userIds: Record<ApiRole, string> = {
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

const fakeSupabaseUsers: Record<
  string,
  { id: string; email: string; user_metadata: { full_name: string } }
> = {
  [tokens.buyer]: {
    id: userIds.buyer,
    email: `buyer-${runId}@example.com`,
    user_metadata: { full_name: 'Buyer Integration' },
  },
  [tokens.vendor]: {
    id: userIds.vendor,
    email: `vendor-${runId}@example.com`,
    user_metadata: { full_name: 'Vendor Integration' },
  },
  [tokens.admin]: {
    id: userIds.admin,
    email: `admin-${runId}@example.com`,
    user_metadata: { full_name: 'Admin Integration' },
  },
};

if (integrationEnabled) {
  process.env.SUPABASE_URL ||= 'https://example.supabase.co';
  process.env.SUPABASE_SECRET_KEY ||= 'integration-test-service-role-key';
  process.env.REDIS_URL ||= 'redis://127.0.0.1:6379';
  process.env.CLOUDINARY_CLOUD_NAME ||= 'integration-test';
  process.env.CLOUDINARY_API_KEY ||= 'integration-test';
  process.env.CLOUDINARY_API_SECRET ||= 'integration-test';

  mock.module('../lib/redis', () => ({ redis: fakeRedis }));
  mock.module('../lib/supabase', () => ({
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

export type ApiIntegrationHarness = {
  events: string[];
  runId: string;
  tokens: Record<ApiRole, string>;
  userIds: Record<ApiRole, string>;
  cleanup: () => Promise<void>;
  close: () => Promise<void>;
  expectError: (result: ApiResult<unknown>, status: number) => { code: string; message: string };
  expectSuccess: <T>(result: ApiResult<T>, status?: number) => T;
  idFromData: (data: ApiData) => string;
  idFromMessage: (message: string | undefined, label: string) => string;
  publish: <T>(event: IEvent<T> | IEvent<T>[]) => Promise<void>;
  requestAs: <T>(role: ApiRole, path: string, options?: RequestOptions) => Promise<ApiResult<T>>;
  seedCatalog: (options?: {
    available?: number;
    createInventory?: boolean;
  }) => Promise<CatalogContext>;
  seedOrder: (options?: { available?: number; quantity?: number }) => Promise<OrderContext>;
  track: (id: string) => string;
  trackCleanup: (cleanup: () => Promise<unknown>) => void;
};

export async function createApiIntegrationHarness(
  options: { dispatchEvents?: boolean } = {},
): Promise<ApiIntegrationHarness> {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required. Run this suite with `bun run test:integration`.');
  }

  const { createApplication } = await import('../composition-root');
  const { createRoutes } = await import('../routes/index');
  const { registerErrorHandler } = await import('../errors/error-handler');
  const { InMemoryEventBus } = await import('../core/infrastructure/buses/in-memory-event-bus');
  const { connectDB } = await import('../lib/mongo');

  await connectDB();

  const events: string[] = [];
  const originalPublish = InMemoryEventBus.prototype.publish;
  const publishSpy = spyOn(InMemoryEventBus.prototype, 'publish').mockImplementation(
    async function (this: InMemoryEventBus, eventOrEvents) {
      const batch = Array.isArray(eventOrEvents) ? eventOrEvents : [eventOrEvents];
      events.push(...batch.map((event) => event.type));
      if (options.dispatchEvents) await originalPublish.call(this, eventOrEvents);
    },
  );

  const application = createApplication();
  const eventBus = application.buses.eventBus;
  const app = new Hono();
  app.route('/', createRoutes(application));
  registerErrorHandler(app);

  for (const role of ['buyer', 'vendor', 'admin'] as const) {
    const response = await app.request('/users/init', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${tokens[role]}`,
      },
    });
    if (response.status !== 202) {
      throw new Error(`User initialization failed: ${response.status} ${await response.text()}`);
    }
  }
  await UserModel.updateOne({ _id: userIds.admin }, { $set: { 'role.role': 'admin' } });
  await UserModel.updateOne({ _id: userIds.vendor }, { $set: { 'role.role': 'vendor' } });

  const trackedIds: string[] = [];
  const customCleanups: Array<() => Promise<unknown>> = [];

  const harness: ApiIntegrationHarness = {
    events,
    runId,
    tokens,
    userIds,
    track(id) {
      trackedIds.push(id);
      return id;
    },
    trackCleanup(cleanup) {
      customCleanups.push(cleanup);
    },
    publish(event) {
      return eventBus.publish(event as IEvent<unknown>);
    },
    async requestAs<T>(role: ApiRole, path: string, options: RequestOptions = {}) {
      const response = await app.request(path, {
        method: options.method ?? 'GET',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${tokens[role]}`,
          ...options.headers,
        },
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
      });
      const body = (await response.json()) as ApiEnvelope<T>;
      return { response, body };
    },
    expectSuccess<T>(result: ApiResult<T>, status = 200) {
      if (result.response.status !== status) {
        throw new Error(
          `Expected ${status}, received ${result.response.status}: ${JSON.stringify(result.body)}`,
        );
      }
      expect(result.response.status).toBe(status);
      expect(result.body.success).toBe(true);
      if (!result.body.success) throw new Error(result.body.error.message);
      return result.body.data;
    },
    expectError(result, status) {
      expect(result.response.status).toBe(status);
      expect(result.body.success).toBe(false);
      if (result.body.success) throw new Error('Expected the request to fail.');
      return result.body.error;
    },
    idFromMessage(message, label) {
      if (!message) throw new Error(`Missing ${label} creation message.`);
      const match = new RegExp(`^${label} ([0-9a-f-]{36}) was`).exec(message);
      const id = match?.[1];
      if (!id) throw new Error(`Could not read ${label} id from message: ${message}`);
      return id;
    },
    idFromData(data) {
      const id = data.updatedData?.id;
      if (!id) throw new Error('Creation response did not include an id.');
      return id;
    },
    async cleanup() {
      const ids = [...trackedIds];
      trackedIds.length = 0;
      const cleanups = [...customCleanups];
      customCleanups.length = 0;
      events.length = 0;
      await Promise.all([
        ...cleanups.map((cleanup) => cleanup()),
        CartModel.deleteMany({ _id: { $in: ids } }),
        CategoryModel.deleteMany({ _id: { $in: ids } }),
        HomeModel.deleteMany({ _id: { $in: ids } }),
        InventoryModel.deleteMany({ _id: { $in: ids } }),
        NotificationModel.deleteMany({ _id: { $in: ids } }),
        OrderRequestModel.deleteMany({ _id: { $in: ids } }),
        OrderItemsModel.deleteMany({ _id: { $in: ids } }),
        OrderModel.deleteMany({ _id: { $in: ids } }),
        PaymentModel.deleteMany({ _id: { $in: ids } }),
        LedgerEntryModel.deleteMany({ _id: { $in: ids } }),
        PayoutModel.deleteMany({ _id: { $in: ids } }),
        ProductVariantModel.deleteMany({ _id: { $in: ids } }),
        ProductModel.deleteMany({ _id: { $in: ids } }),
        CouponModel.deleteMany({ _id: { $in: ids } }),
        CouponRedemptionModel.deleteMany({ _id: { $in: ids } }),
        ReturnModel.deleteMany({ _id: { $in: ids } }),
        ReviewModel.deleteMany({ _id: { $in: ids } }),
        ShipmentModel.deleteMany({ _id: { $in: ids } }),
        AddressModel.deleteMany({ _id: { $in: ids } }),
        VendorModel.deleteMany({ _id: { $in: ids } }),
      ]);
    },
    async close() {
      publishSpy.mockRestore();
      await UserModel.deleteMany({ _id: { $in: Object.values(userIds) } });
      const { disconnectDB } = await import('../lib/mongo');
      await disconnectDB();
      mock.restore();
    },
    async seedCatalog(options = {}) {
      const available = options.available ?? 10;
      const categoryData = harness.expectSuccess<ApiData>(
        await harness.requestAs('admin', '/category/admin', {
          method: 'POST',
          body: {
            title: `Integration category ${runId}`,
            image: 'https://example.com/category.png',
          },
        }),
      );
      const categoryId = harness.track(harness.idFromMessage(categoryData.message, 'Category'));

      const vendorData = harness.expectSuccess<ApiData>(
        await harness.requestAs('vendor', '/vendor/me', {
          method: 'POST',
          body: {
            title: `Integration vendor ${runId}`,
            description: 'Integration test vendor used for database integration coverage.',
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
      const vendorId = harness.track(harness.idFromMessage(vendorData.message, 'Vendor'));

      harness.expectSuccess(
        await harness.requestAs('admin', '/vendor/admin/verify', {
          method: 'PATCH',
          body: { vendorId },
        }),
      );

      const productData = harness.expectSuccess<ApiData>(
        await harness.requestAs('vendor', '/product/vendor', {
          method: 'POST',
          body: {
            title: `Integration product ${runId}`,
            categoryId,
            appearance: 'public',
            description: 'Integration test product used for database integration coverage.',
            ingredient: { isIngredients: false, ingredients: [] },
            disclaimer: { isDisclaimer: false, disclaimers: [] },
            image: {
              images: [
                {
                  url: 'https://example.com/product.png',
                  alt: 'Integration product',
                  default: true,
                },
              ],
            },
          },
        }),
      );
      const productId = harness.track(harness.idFromMessage(productData.message, 'Product'));

      const variantData = harness.expectSuccess<ApiData>(
        await harness.requestAs('vendor', '/product-variant/vendor', {
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
      const variantId = harness.track(harness.idFromMessage(variantData.message, 'Variant'));

      let inventoryId = '';
      if (options.createInventory !== false) {
        const inventoryData = harness.expectSuccess<ApiData>(
          await harness.requestAs('admin', '/product-inventory/admin', {
            method: 'POST',
            body: { variantId, lowStockThreshold: 1, available },
          }),
        );
        inventoryId = harness.track(harness.idFromData(inventoryData));
      }

      const addressData = harness.expectSuccess<ApiData>(
        await harness.requestAs('buyer', '/address/my', {
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
      const addressId = harness.track(harness.idFromData(addressData));

      return { addressId, categoryId, inventoryId, productId, variantId, vendorId };
    },
    async seedOrder(options = {}) {
      const catalog = await harness.seedCatalog({ available: options.available ?? 10 });
      const idempotentKey = Id.create().value;
      const data = harness.expectSuccess<ApiData>(
        await harness.requestAs('buyer', '/order/my', {
          method: 'POST',
          body: {
            idempotentKey,
            addressId: catalog.addressId,
            safeOrder: true,
            waitingTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            items: [{ variantId: catalog.variantId, quantity: options.quantity ?? 1 }],
          },
        }),
      );
      const orderId = harness.track(harness.idFromData(data));
      const items = await OrderItemsModel.find({ orderId }).lean();
      for (const item of items) harness.track(String(item._id));
      const itemId = items.length > 0 ? String(items[0]?._id) : '';
      if (!itemId) throw new Error('Order creation did not create an order item.');
      harness.trackCleanup(() => OrderItemsModel.deleteMany({ orderId }));
      return { ...catalog, idempotentKey, itemId, orderId };
    },
  };

  return harness;
}
