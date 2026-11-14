import { describe, expect, it } from 'bun:test';
import type { IEvent } from '@ecomerece/domain/events/event-bus.interface';
import { ExpirationDate } from '@ecomerece/domain/value-objects/expiration-date.vo';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import { OrderApplicationService } from '../order.app.service';

const id = (n: number) => Id.create(`00000000-0000-7000-8000-${String(n).padStart(12, '0')}`).value;

const actor = { _id: id(1), image: '', name: { fullName: 'Test Buyer' } };

const waitingTime = new Date(Date.now() + 2 * 60 * 60 * 1000);

/** Variant -> product -> vendor: variant 2 belongs to vendor 4, variant 5 to vendor 7. */
const catalog = new Map([
  [id(2), { productId: id(3), vendorId: id(4) }],
  [id(5), { productId: id(6), vendorId: id(7) }],
]);

function buildService() {
  const createdOrders: { vendorIds: string[]; orderType: string; orderId: string }[] = [];
  const writtenItems: { orderId: string; vendorId: string; variantId: string }[] = [];
  const published: IEvent[] = [];
  const itemEvent = { type: 'order-item.created', payload: {} } as IEvent;

  const orderRepo = {
    EnsureUniqueImpodentKey: async () => {},
    Create: async (order: {
      id: { value: string };
      vendorIds: { value: string }[];
      orderType: { value: string };
    }) => {
      createdOrders.push({
        orderId: order.id.value,
        vendorIds: order.vendorIds.map((vendorId) => vendorId.value),
        orderType: order.orderType.value,
      });
    },
  };

  const unitOfWork = {
    transaction: async <T>(callback: () => Promise<T>): Promise<T> => callback(),
  };

  const eventBus = {
    publish: async (events: IEvent | IEvent[]) => {
      published.push(...(Array.isArray(events) ? events : [events]));
    },
  };

  const addressQueries = {
    ensureActiveById: async () => ({
      address: { fullAddress: '123 Main Street, Springfield' },
      active: true,
    }),
  };

  const variantQueries = {
    verifyAndGet: async (variantIds: Id[]) => ({
      variantReadModel: variantIds.map((variantId) => ({
        id: variantId.value,
        productId: catalog.get(variantId.value)?.productId,
        price: 10,
      })),
      notFoundIds: [],
      deletedIds: [],
      nonActiveIds: [],
    }),
  };

  const productQueries = {
    verifyAndGet: async (productIds: Id[]) => ({
      productReadModel: productIds.map((productId) => {
        const entry = [...catalog.values()].find((line) => line.productId === productId.value);
        return { id: productId.value, vendorId: entry?.vendorId };
      }),
    }),
  };

  const inventoryReservation = {
    reserve: async (lines: { variantId: Id }[]) => ({
      buyableIds: lines.map((line) => line.variantId),
      lines: lines.map((line) => ({ variantId: line.variantId, reserved: true, reason: null })),
    }),
  };

  const orderItemsWriter = {
    create: async (items: { orderId: Id; vendorId: Id; variantId: Id }[]) => {
      writtenItems.push(
        ...items.map((item) => ({
          orderId: item.orderId.value,
          vendorId: item.vendorId.value,
          variantId: item.variantId.value,
        })),
      );
      return items.length === 0 ? [] : [itemEvent];
    },
  };

  const orderItemsQueries = { getByOrderId: async () => [] };

  const service = new OrderApplicationService(
    orderRepo as never,
    addressQueries as never,
    variantQueries as never,
    productQueries as never,
    eventBus as never,
    inventoryReservation as never,
    orderItemsWriter as never,
    orderItemsQueries as never,
    unitOfWork as never,
    {} as never,
  );

  return { service, createdOrders, writtenItems, published };
}

describe('OrderApplicationService order types', () => {
  it('buyNow creates a single order with exactly one vendor', async () => {
    const { service, createdOrders, writtenItems, published } = buildService();

    await service.buyNow(
      { idempotentKey: id(10), addressId: id(11), variantId: id(2), quantity: 1, waitingTime },
      actor,
    );

    expect(createdOrders).toEqual([
      { orderId: expect.any(String), vendorIds: [id(4)], orderType: 'single' },
    ]);
    expect(writtenItems).toHaveLength(1);
    expect(published.map((event) => event.type)).toEqual(['order-item.created', 'order.created']);
  });

  it('createMyOrder spanning two vendors creates one cart order with both vendors', async () => {
    const { service, createdOrders, writtenItems } = buildService();

    await service.createMyOrder(
      {
        idempotentKey: id(10),
        addressId: id(11),
        safeOrder: true,
        waitingTime,
        items: [
          { variantId: id(2), quantity: 1 },
          { variantId: id(5), quantity: 2 },
        ],
      },
      actor,
    );

    expect(writtenItems).toHaveLength(2);
    expect(createdOrders).toHaveLength(1);
    expect(createdOrders[0]).toMatchObject({
      vendorIds: [id(4), id(7)],
      orderType: 'cart',
    });
  });

  it('createFromCart creates one order for every vendor instead of one order per vendor', async () => {
    const { service, createdOrders, writtenItems } = buildService();

    const result = await service.createFromCart({
      idempotentKey: Id.create(id(12)),
      buyerId: Id.create(id(1)),
      addressId: Id.create(id(11)),
      waitingTime: ExpirationDate.create(waitingTime),
      items: [
        { variantId: Id.create(id(2)), quantity: Quantity.create(1) },
        { variantId: Id.create(id(5)), quantity: Quantity.create(2) },
      ],
    });

    expect(createdOrders).toHaveLength(1);
    expect(createdOrders[0].vendorIds).toEqual([id(4), id(7)]);
    expect(result).toMatchObject({ orderType: 'cart', vendorIds: [id(4), id(7)], totalPrice: 30 });
    // One order row, so every written line carries that same order id.
    expect(new Set(writtenItems.map((item) => item.orderId))).toEqual(
      new Set([createdOrders[0].orderId]),
    );
  });
});
