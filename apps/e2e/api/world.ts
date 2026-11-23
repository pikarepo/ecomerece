import { randomUUID } from 'node:crypto';
import type { APIRequestContext } from '@playwright/test';
import type { CleanupRegistry } from './cleanup';
import { databaseConfigured, deleteDocuments } from './database';
import { expectOk } from './envelope';
import { createCatalogContext, type CatalogContext } from './factories';
import { type MessageData, requireRecordId, uniqueSuffix } from './identifiers';
import {
  createVendorProfile,
  ensureBuyerAddress,
  readMyVendor,
  verifyVendor,
} from './scenarios';

export type VendorWorkspace = CatalogContext & { vendorId: string };

export type OrderWorkspace = VendorWorkspace & {
  addressId: string;
  orderId: string;
  itemId: string;
};

export type PaidOrderWorkspace = OrderWorkspace & {
  paymentId: string;
  paymentAmount: number;
};

type TenantApis = {
  admin: APIRequestContext;
  vendor: APIRequestContext;
  cleanup: CleanupRegistry;
  suffix?: string;
  available?: number;
};

type OrderApis = TenantApis & { buyer: APIRequestContext };

type PaidOrderApis = OrderApis & { quantity?: number };

type PaymentReadModel = {
  id: string;
  orderId: string;
  buyerId: string;
  amount: number;
  capturedAmount: number;
  refundedAmount: number;
  status: string;
};

/** `vendorMiddleware` requires one verified vendor per account; reuse it across parallel tests. */
export const ensureVendorProfile = async (
  args: Omit<TenantApis, 'available'>,
): Promise<string> => {
  const { admin, vendor, suffix = uniqueSuffix() } = args;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const existing = await readMyVendor(vendor);
    if (existing) {
      if (!existing.verification?.isVerified) await verifyVendor(admin, existing.id);
      return existing.id;
    }

    try {
      const vendorId = await createVendorProfile({ api: vendor, suffix });
      await verifyVendor(admin, vendorId);
      return vendorId;
    } catch (error) {
      const message = String(error);
      if (!/only one vendor|ownerId .*already exists/i.test(message) || attempt === 4) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 100 * (attempt + 1)));
    }
  }

  throw new Error('Unable to provision the shared vendor profile.');
};

/** A vendor profile must be verified before its products can be sold. */
export const buildVendorWorkspace = async ({
  admin,
  vendor,
  cleanup,
  suffix = uniqueSuffix(),
  available = 10,
}: TenantApis): Promise<VendorWorkspace> => {
  const vendorId = await ensureVendorProfile({ admin, vendor, cleanup, suffix });
  const catalog = await createCatalogContext({ admin, vendor, cleanup, suffix, available });
  return { vendorId, ...catalog };
};

export const buildOrderWorkspace = async ({
  admin,
  vendor,
  buyer,
  cleanup,
  suffix = uniqueSuffix(),
  available = 10,
}: OrderApis): Promise<OrderWorkspace> => {
  const workspace = await buildVendorWorkspace({ admin, vendor, cleanup, suffix, available });

  const addressId = await ensureBuyerAddress({ buyer, suffix });

  const orderData = await expectOk<MessageData>(
    await buyer.post('/order/my', {
      data: {
        idempotentKey: randomUUID(),
        addressId,
        safeOrder: true,
        waitingTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        items: [{ variantId: workspace.variantId, quantity: 1 }],
      },
    }),
  );
  const orderId = requireRecordId(orderData.updatedData, 'Order');
  cleanup.addRequest(
    'order',
    buyer,
    'post',
    `/order/my/${orderId}/cancel`,
    { reason: 'E2E cleanup.' },
    [400, 404],
  );

  const items = await expectOk<Array<{ id?: string; _id?: string }>>(
    await buyer.get(`/order-items/my/order/${orderId}`),
  );
  const itemId = requireRecordId(items[0], 'Item');

  return { ...workspace, addressId, orderId, itemId };
};

/**
 * Walks the real buyer checkout: intent, authorize, capture. The amount comes
 * from the API so the tests never bet on a hardcoded order total.
 */
export const buildPaidOrder = async ({
  admin,
  vendor,
  buyer,
  cleanup,
  suffix = uniqueSuffix(),
}: PaidOrderApis): Promise<PaidOrderWorkspace> => {
  const workspace = await buildOrderWorkspace({ admin, vendor, buyer, cleanup, suffix });

  const payment = await expectOk<PaymentReadModel>(
    await buyer.post('/payment/my', { data: { orderId: workspace.orderId, currency: 'USD' } }),
  );
  await expectOk(await buyer.post(`/payment/my/${payment.id}/authorize`));
  const captured = await expectOk<PaymentReadModel>(
    await buyer.post(`/payment/my/${payment.id}/capture`, { data: { amount: payment.amount } }),
  );

  if (databaseConfigured()) {
    cleanup.add('payment rows', async () => {
      await deleteDocuments('payments', { _id: payment.id });
      await deleteDocuments('ledgerentries', { referenceId: payment.id });
    });
  }

  return {
    ...workspace,
    paymentId: payment.id,
    paymentAmount: captured.amount,
  };
};
