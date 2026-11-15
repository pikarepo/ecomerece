import { describe, expect, it } from 'bun:test';
import type { IEvent } from '@ecomerece/domain/events/event-bus.interface';
import { OrderRequestAggregate } from '@ecomerece/domain/modules/order-request/order-request.aggregate';
import { OrderRequestTypeVO } from '@ecomerece/domain/modules/order-request/value-objects/order-request-type.vo';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { Reason } from '@ecomerece/domain/value-objects/reason.vo';
import { OrderRequestApplicationService } from '../order-request.app.service';

const id = (n: number) => Id.create(`00000000-0000-7000-8000-${String(n).padStart(12, '0')}`).value;

const buyer = { _id: id(1), image: '', name: { fullName: 'Test Buyer' } };
const vendorActor = { _id: id(3), image: '', name: { fullName: 'Test Vendor' } };
const adminActor = { _id: id(9), image: '', name: { fullName: 'Test Admin' } };

const dataUri = 'data:image/png;base64,aGVsbG8=';

function buildRequest(
  overrides: { orderItemId?: Id | null; vendorId?: Id; type?: OrderRequestTypeVO } = {},
) {
  const request = OrderRequestAggregate.create({
    id: Id.create(id(50)),
    orderId: Id.create(id(20)),
    orderItemId: overrides.orderItemId ?? null,
    vendorId: overrides.vendorId ?? Id.create(id(4)),
    buyerId: Id.create(buyer._id),
    type: overrides.type ?? OrderRequestTypeVO.return(),
    reason: Reason.create('damaged in transit'),
    note: null,
    images: [],
  });
  request.clearEvents();
  return request;
}

function buildHarness(
  options: {
    order?: { buyerId?: string; status?: string; vendorIds?: string[] };
    item?: { status?: string; vendorId?: string | null; quantity?: number } | null;
    existingRequest?: OrderRequestAggregate;
    upload?: boolean;
    createFails?: boolean;
  } = {},
) {
  const calls: string[] = [];
  const published: IEvent[] = [];
  const unsoldLines: { variantId: string; quantity: number }[][] = [];
  const deletedKeys: string[] = [];
  let saved: OrderRequestAggregate | null = options.existingRequest ?? null;

  const order = {
    _id: id(20),
    buyerId: options.order?.buyerId ?? buyer._id,
    status: options.order?.status ?? 'confirmed',
    vendorIds: options.order?.vendorIds ?? [id(4)],
  };

  const item =
    options.item === null
      ? null
      : {
          _id: id(30),
          orderId: order._id,
          variantId: id(2),
          quantity: options.item?.quantity ?? 2,
          status: options.item?.status ?? 'confirmed',
          vendorId: options.item?.vendorId ?? id(4),
        };

  const repo = {
    FindByIdOrThrow: async () => {
      calls.push('load-request');
      if (!saved) throw new Error('Order request not found.');
      return saved;
    },
    Create: async (request: OrderRequestAggregate) => {
      calls.push('create-request');
      if (options.createFails) throw new Error('write failed');
      saved = request;
    },
    Save: async (request: OrderRequestAggregate) => {
      calls.push('save-request');
      saved = request;
    },
  };

  const orderQueries = {
    ensureActiveById: async () => ({ order, active: true }),
  };

  const orderItemsQueries = {
    getByOrderId: async () => {
      calls.push('read-items');
      return item ? [item] : [];
    },
  };

  const orderItemsWriter = {
    returnItems: async () => {
      calls.push('write-items:return');
      return [{ type: 'order-item.returned' } as IEvent];
    },
    refund: async () => {
      calls.push('write-items:refund');
      return [{ type: 'order-item.refunded' } as IEvent];
    },
  };

  const orderWriter = {
    returnOrder: async () => {
      calls.push('write-order:return');
    },
    refundOrder: async () => {
      calls.push('write-order:refund');
    },
    returnOrderAsAdmin: async () => {
      calls.push('write-order:return-admin');
    },
    refundOrderAsAdmin: async () => {
      calls.push('write-order:refund-admin');
    },
  };

  const inventoryReservation = {
    unsold: async (lines: { variantId: Id; quantity: { value: number } }[]) => {
      calls.push('inventory:unsold');
      unsoldLines.push(
        lines.map((line) => ({ variantId: line.variantId.value, quantity: line.quantity.value })),
      );
    },
  };

  const vendorQueries = {
    ensureActiveByUserId: async () => {
      calls.push('resolve-vendor');
      return { vendor: { id: id(4) }, active: true };
    },
  };

  const imageStorage = {
    upload: async () => {
      calls.push('image:upload');
      return {
        key: { value: 'order-requests/evidence.png' },
        publicUrl: 'https://cdn.example.com/order-requests/evidence.png',
      };
    },
    delete: async (key: { value: string }) => {
      calls.push('image:delete');
      deletedKeys.push(key.value);
    },
  };

  const eventBus = {
    publish: async (events: IEvent | IEvent[]) => {
      calls.push('publish');
      published.push(...(Array.isArray(events) ? events : [events]));
    },
  };

  const unitOfWork = {
    transaction: async <T>(callback: () => Promise<T>): Promise<T> => callback(),
    deferAfterCommit: async (work: () => Promise<void> | void) => work(),
  };

  const service = new OrderRequestApplicationService(
    repo as never,
    orderQueries as never,
    orderItemsQueries as never,
    orderItemsWriter as never,
    orderWriter as never,
    inventoryReservation as never,
    vendorQueries as never,
    imageStorage as never,
    eventBus as never,
    unitOfWork as never,
  );

  return { service, calls, published, unsoldLines, deletedKeys, getSaved: () => saved };
}

describe('OrderRequestApplicationService', () => {
  it('rejects a request for an order the buyer does not own', async () => {
    const { service, calls } = buildHarness({ order: { buyerId: id(2) } });

    await expect(
      service.createMyOrderRequest(
        { orderId: id(20), type: 'return', reason: 'damaged in transit' },
        buyer,
      ),
    ).rejects.toThrow('You do not own this order.');
    expect(calls).not.toContain('image:upload');
  });

  it('requires an order item when the order spans multiple vendors', async () => {
    const { service } = buildHarness({ order: { vendorIds: [id(4), id(5)] } });

    await expect(
      service.createMyOrderRequest(
        { orderId: id(20), type: 'return', reason: 'damaged in transit' },
        buyer,
      ),
    ).rejects.toThrow('Select an order item for a multi-vendor order.');
  });

  it('uses the line status, not the order status, to validate item requests', async () => {
    const { service } = buildHarness({ order: { status: 'pending' }, item: { status: 'pending' } });

    await expect(
      service.createMyOrderRequest(
        { orderId: id(20), orderItemId: id(30), type: 'return', reason: 'damaged in transit' },
        buyer,
      ),
    ).rejects.toThrow('A return request is not allowed for a pending order.');
  });

  it('uploads data-uri evidence and stores the returned key', async () => {
    const { service, calls, getSaved } = buildHarness({ order: { status: 'confirmed' } });

    await service.createMyOrderRequest(
      { orderId: id(20), type: 'return', reason: 'damaged in transit', images: [dataUri] },
      buyer,
    );

    expect(calls).toContain('image:upload');
    expect(getSaved()?.images.map((image) => ({ url: image.url.value, key: image.key }))).toEqual([
      {
        url: 'https://cdn.example.com/order-requests/evidence.png',
        key: 'order-requests/evidence.png',
      },
    ]);
  });

  it('stores external image URLs without uploading them', async () => {
    const { service, calls, getSaved } = buildHarness();

    await service.createMyOrderRequest(
      {
        orderId: id(20),
        type: 'return',
        reason: 'damaged in transit',
        images: ['https://example.com/evidence.png'],
      },
      buyer,
    );

    expect(calls).not.toContain('image:upload');
    expect(getSaved()?.images[0]?.url.value).toBe('https://example.com/evidence.png');
    expect(getSaved()?.images[0]?.key).toBeNull();
  });

  it('deletes uploaded evidence when persistence fails', async () => {
    const { service, deletedKeys } = buildHarness({ createFails: true });

    await expect(
      service.createMyOrderRequest(
        { orderId: id(20), type: 'return', reason: 'damaged in transit', images: [dataUri] },
        buyer,
      ),
    ).rejects.toThrow('write failed');
    expect(deletedKeys).toEqual(['order-requests/evidence.png']);
  });

  it('blocks a vendor from accepting another vendor request', async () => {
    const request = buildRequest({ vendorId: Id.create(id(5)) });
    const { service, calls } = buildHarness({ existingRequest: request });

    await expect(service.acceptVendorOrderRequest(id(50), {}, vendorActor)).rejects.toThrow(
      'This order request does not belong to your vendor.',
    );
    expect(calls).not.toContain('write-items:return');
  });

  it('accepting an item return cascades to the line and returns stock', async () => {
    const request = buildRequest({ orderItemId: Id.create(id(30)) });
    const { service, calls, published, unsoldLines } = buildHarness({
      existingRequest: request,
      item: { status: 'confirmed', quantity: 2 },
    });

    const result = await service.acceptVendorOrderRequest(
      id(50),
      { note: 'approved' },
      vendorActor,
    );

    expect(calls).toEqual([
      'load-request',
      'resolve-vendor',
      'read-items',
      'write-items:return',
      'inventory:unsold',
      'save-request',
      'publish',
    ]);
    expect(unsoldLines).toEqual([[{ variantId: id(2), quantity: 2 }]]);
    expect(result.updatedData?.status).toBe('accepted');
    expect(published.map((event) => event.type)).toContain('order-request.accepted');
  });

  it('refunding an already returned item does not return its stock twice', async () => {
    const request = buildRequest({
      orderItemId: Id.create(id(30)),
      type: OrderRequestTypeVO.refund(),
    });
    const { service, calls, unsoldLines } = buildHarness({
      existingRequest: request,
      item: { status: 'returned', quantity: 2 },
    });

    await service.acceptVendorOrderRequest(id(50), {}, vendorActor);

    expect(calls).toContain('write-items:refund');
    expect(calls).not.toContain('inventory:unsold');
    expect(unsoldLines).toEqual([]);
  });

  it('admin acceptance of a whole-order refund uses the admin writer', async () => {
    const request = buildRequest({ type: OrderRequestTypeVO.refund() });
    const { service, calls, getSaved } = buildHarness({ existingRequest: request });

    await service.acceptAdminOrderRequest(id(50), { note: 'approved' }, adminActor);

    expect(calls).toEqual(['load-request', 'write-order:refund-admin', 'save-request', 'publish']);
    expect(getSaved()?.status.isAccepted).toBe(true);
  });

  it('a buyer cannot cancel another buyer request', async () => {
    const request = buildRequest();
    const { service } = buildHarness({ existingRequest: request });

    await expect(service.cancelMyOrderRequest(id(50), { ...buyer, _id: id(2) })).rejects.toThrow(
      'Only the buyer who submitted the request may cancel it.',
    );
  });
});
