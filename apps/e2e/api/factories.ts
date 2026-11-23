import { randomUUID } from 'node:crypto';
import type { APIRequestContext } from '@playwright/test';
import { expectOk } from './envelope';
import type { CleanupRegistry } from './cleanup';
import { ensureBuyerAddress } from './scenarios';
import {
  type MessageData,
  requireIdFromMessage,
  requireRecordId,
  uniqueSuffix,
} from './identifiers';

export type CatalogContext = {
  categoryId: string;
  productId: string;
  variantId: string;
  inventoryId: string;
};

export type OrderContext = CatalogContext & {
  addressId: string;
  orderId: string;
  itemId: string;
};

type ContextOptions = {
  admin: APIRequestContext;
  vendor: APIRequestContext;
  cleanup: CleanupRegistry;
  suffix?: string;
  available?: number;
};

type OrderOptions = ContextOptions & {
  buyer: APIRequestContext;
  available?: number;
  quantity?: number;
};

const cleanupReason = 'E2E cleanup.';

export const createCatalogContext = async ({
  admin,
  vendor,
  cleanup,
  suffix = uniqueSuffix(),
  available = 10,
}: ContextOptions): Promise<CatalogContext> => {
  const categoryData = await expectOk<MessageData>(
    await admin.post('/category/admin', {
      data: {
        title: `E2E category ${suffix}`,
        image: 'https://example.com/e2e-category.png',
      },
    }),
  );
  const categoryId = requireIdFromMessage(categoryData.message, 'Category');
  cleanup.addRequest('category', admin, 'delete', '/category/admin', {
    id: categoryId,
    reason: cleanupReason,
  });

  const productData = await expectOk<MessageData>(
    await vendor.post('/product/vendor', {
      data: {
        title: `E2E product ${suffix}`,
        categoryId,
        appearance: 'public',
        description: 'E2E product used by write coverage.',
        ingredient: { isIngredients: false, ingredients: [] },
        disclaimer: { isDisclaimer: false, disclaimers: [] },
        image: {
          images: [
            { url: 'https://example.com/e2e-product.png', alt: 'E2E product', default: true },
          ],
        },
      },
    }),
  );
  const productId = requireIdFromMessage(productData.message, 'Product');
  cleanup.addRequest(
    'product',
    vendor,
    'delete',
    '/product/vendor',
    {
      productId,
      reason: cleanupReason,
    },
    [400, 404],
  );

  const variantData = await expectOk<MessageData>(
    await vendor.post('/product-variant/vendor', {
      data: {
        productId,
        title: `E2E variant ${suffix}`,
        price: 100,
        discountedPrice: 80,
        active: true,
      },
    }),
  );
  const variantId = requireIdFromMessage(variantData.message, 'Variant');
  cleanup.addRequest(
    'variant',
    vendor,
    'delete',
    '/product-variant/vendor/soft',
    {
      productId,
      variantId,
      reason: cleanupReason,
    },
    [400, 404],
  );

  const inventoryData = await expectOk<MessageData>(
    await admin.post('/product-inventory/admin', {
      data: { variantId, available, lowStockThreshold: 1 },
    }),
  );
  const inventoryId = requireRecordId(inventoryData.updatedData, 'Inventory');
  cleanup.addRequest(
    'inventory',
    admin,
    'delete',
    `/product-inventory/admin/${inventoryId}`,
    undefined,
    [400, 404],
  );

  return { categoryId, productId, variantId, inventoryId };
};

export const createOrderContext = async ({
  admin,
  vendor,
  buyer,
  cleanup,
  suffix = uniqueSuffix(),
  available = 10,
  quantity = 2,
}: OrderOptions): Promise<OrderContext> => {
  const catalog = await createCatalogContext({ admin, vendor, cleanup, suffix, available });

  const addressId = await ensureBuyerAddress({ buyer, suffix });

  const orderData = await expectOk<MessageData>(
    await buyer.post('/order/my', {
      data: {
        idempotentKey: randomUUID(),
        addressId,
        safeOrder: true,
        waitingTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        items: [{ variantId: catalog.variantId, quantity }],
      },
    }),
  );
  const orderId = requireRecordId(orderData.updatedData, 'Order');
  cleanup.addRequest(
    'order',
    buyer,
    'post',
    `/order/my/${orderId}/cancel`,
    {
      reason: cleanupReason,
    },
    [400, 404],
  );

  const items = await expectOk<Array<{ id?: string; _id?: string }>>(
    await buyer.get(`/order-items/my/order/${orderId}`),
  );
  const itemId = requireRecordId(items[0], 'Item');

  return {
    ...catalog,
    addressId,
    orderId,
    itemId,
  };
};
