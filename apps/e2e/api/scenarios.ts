import { randomUUID } from 'node:crypto';
import type { APIRequestContext } from '@playwright/test';
import type { CleanupRegistry } from './cleanup';
import { expectOk } from './envelope';
import {
  type MessageData,
  requireIdFromMessage,
  requireRecordId,
  uniqueSuffix,
} from './identifiers';

export const cleanupReason = 'E2E write coverage cleanup.';

type OrderFixture = {
  orderId: string;
  itemId: string;
};

type VendorFixtureOptions = {
  api: APIRequestContext;
  suffix?: string;
};

type PendingRequestOptions = {
  admin: APIRequestContext;
  buyer: APIRequestContext;
  vendor: APIRequestContext;
  cleanup: CleanupRegistry;
  orderId: string;
  itemId: string;
};

export const newIdempotentKey = (): string => randomUUID();

export const futureWaitingTime = (): string => new Date(Date.now() + 60 * 60 * 1000).toISOString();

export const registerOrderCleanup = (
  admin: APIRequestContext,
  cleanup: CleanupRegistry,
  orderId: string,
): void => {
  cleanup.addRequest(
    'order terminal cleanup',
    admin,
    'delete',
    `/order/admin/${orderId}`,
    {
      reason: cleanupReason,
    },
    [400, 404],
  );
};

export const registerShipmentCleanup = (
  admin: APIRequestContext,
  cleanup: CleanupRegistry,
  shipmentId: string,
): void => {
  cleanup.add('shipment recover', async () => {
    await admin.patch(`/shipping/admin/${shipmentId}/recover`);
  });
  cleanup.addRequest(
    'shipment',
    admin,
    'delete',
    `/shipping/admin/${shipmentId}`,
    {
      reason: cleanupReason,
    },
    [400, 404],
  );
};

export const registerReturnCleanup = (
  admin: APIRequestContext,
  cleanup: CleanupRegistry,
  returnId: string,
): void => {
  cleanup.add('return recover', async () => {
    await admin.patch(`/return/admin/${returnId}/recover`);
  });
  cleanup.addRequest(
    'return',
    admin,
    'delete',
    `/return/admin/${returnId}`,
    {
      reason: cleanupReason,
    },
    [400, 404],
  );
};

export const createCompletedItemOrder = async (
  buyer: APIRequestContext,
  vendor: APIRequestContext,
  order: OrderFixture,
): Promise<void> => {
  await expectOk<MessageData>(await vendor.post(`/order-items/vendor/${order.itemId}/confirm`));
  await expectOk<MessageData>(await vendor.post(`/order-items/vendor/${order.itemId}/complete`));
};

export const createPendingRequest = async ({
  admin,
  buyer,
  cleanup,
  itemId,
  orderId,
  vendor,
}: PendingRequestOptions): Promise<string> => {
  await createCompletedItemOrder(buyer, vendor, { orderId, itemId });
  await expectOk<MessageData>(
    await buyer.post('/order-request/my', {
      data: {
        orderId,
        orderItemId: itemId,
        type: 'return',
        reason: 'E2E request coverage.',
        note: 'Created by the API E2E request coverage suite.',
        images: ['https://example.com/e2e-request.png'],
      },
    }),
  );

  const requests = await expectOk<Array<{ id?: string; _id?: string; orderId?: string }>>(
    await buyer.get('/order-request/my?limit=20'),
  );
  const request = requests.find((candidate) => candidate.orderId === orderId);
  const requestId = requireRecordId(request, 'Order request');
  cleanup.addRequest(
    'order request',
    buyer,
    'patch',
    `/order-request/my/${requestId}/cancel`,
    undefined,
    [400, 404],
  );
  registerOrderCleanup(admin, cleanup, orderId);
  return requestId;
};

export const createReturn = async (
  buyer: APIRequestContext,
  vendor: APIRequestContext,
  admin: APIRequestContext,
  cleanup: CleanupRegistry,
  order: OrderFixture,
): Promise<string> => {
  await createCompletedItemOrder(buyer, vendor, order);
  const created = await expectOk<MessageData>(
    await buyer.post('/return/my', {
      data: {
        orderId: order.orderId,
        orderItemId: order.itemId,
        quantity: 1,
        returnType: 'refund',
        reason: 'E2E return coverage.',
      },
    }),
  );
  const returnId = requireRecordId(created.updatedData, 'Return');
  registerReturnCleanup(admin, cleanup, returnId);
  registerOrderCleanup(admin, cleanup, order.orderId);
  return returnId;
};

type MyVendor = {
  id: string;
  verification?: { isVerified?: boolean };
};

type BuyerAddress = {
  id: string;
};

export const ensureBuyerAddress = async ({
  buyer,
  suffix = uniqueSuffix(),
}: {
  buyer: APIRequestContext;
  suffix?: string;
}): Promise<string> => {
  const existing = await expectOk<BuyerAddress[] | null>(await buyer.get('/address/my'));
  if (existing?.length) return existing[0].id;

  try {
    const created = await expectOk<MessageData>(
      await buyer.post('/address/my', {
        data: {
          streetAddress: `${suffix} E2E Street`,
          city: 'Lahore',
          state: 'Punjab',
          postalCode: '54000',
          country: 'Pakistan',
        },
      }),
    );
    return requireRecordId(created.updatedData, 'Address');
  } catch (error) {
    if (!/maximum of four addresses/i.test(String(error))) throw error;
    const fallback = await expectOk<BuyerAddress[] | null>(await buyer.get('/address/my'));
    if (fallback?.length) return fallback[0].id;
    throw error;
  }
};

export const readMyVendor = async (api: APIRequestContext): Promise<MyVendor | null> => {
  const response = await api.get('/vendor/me');
  if (response.status() === 404) return null;
  return expectOk<MyVendor>(response);
};

export const verifyVendor = async (
  admin: APIRequestContext,
  vendorId: string,
): Promise<void> => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await admin.patch('/vendor/admin/verify', { data: { vendorId } });
    if (response.ok()) return;

    const payload = (await response.json()) as { error?: { code?: string; message?: string } };
    const message = payload.error?.message ?? '';
    if (/already verified/i.test(message)) return;
    if (payload.error?.code !== 'CONCURRENCY_ERROR' || attempt === 4) {
      throw new Error(`Vendor verification failed: ${message}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 100 * (attempt + 1)));
  }
};

export const createVendorProfile = async ({
  api,
  suffix = uniqueSuffix(),
}: VendorFixtureOptions): Promise<string> => {
  const created = await expectOk<MessageData>(
    await api.post('/vendor/me', {
      data: {
        title: `E2E vendor ${suffix}`,
        description: 'Vendor created by the API E2E coverage suite.',
        slug: `e2e-vendor-${suffix}`,
        contacts: {
          phone: '+10000000000',
          email: 'e2e-vendor@example.com',
          address: {
            streetAddress: `${suffix} E2E Street`,
            city: 'Lahore',
            state: 'Punjab',
            postalCode: '54000',
            country: 'Pakistan',
          },
        },
        image: {
          logo: 'https://example.com/e2e-vendor-logo.png',
          banner: 'https://example.com/e2e-vendor-banner.png',
        },
      },
    }),
  );
  return requireIdFromMessage(created.message, 'Vendor');
};
