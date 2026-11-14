import { describe, expect, it } from 'bun:test';
import { OrderItemsAggregate } from '@ecomerece/domain';
import { StatusVo } from '@ecomerece/domain/modules/order-items/value-objects/status.vo';
import { DeleteInfoVO } from '@ecomerece/domain/value-objects/delete-info.vo';
import { EffectiveDate } from '@ecomerece/domain/value-objects/effective-date.vo';
import { ExpirationDate } from '@ecomerece/domain/value-objects/expiration-date.vo';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { Money } from '@ecomerece/domain/value-objects/money.vo';
import { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import { Reason } from '@ecomerece/domain/value-objects/reason.vo';
import { ForbiddenError } from '../../../../errors/app-error';
import { OrderItemsMapper } from '../../infrastructure/order-item.mapper';
import { OrderItemsApplicationService } from '../order-item.app.service';

const id = (n: number) => Id.create(`00000000-0000-7000-8000-${String(n).padStart(12, '0')}`);

const ITEM_ID = id(100);
const ORDER_ID = id(10);
const VENDOR_ID = id(4);
const OTHER_VENDOR_ID = id(5);
const BUYER_ID = id(7);

const actor = { _id: BUYER_ID.value } as never;

function orderItem(vendorId: Id) {
  return OrderItemsAggregate.rehydrate(
    ITEM_ID,
    ORDER_ID,
    vendorId,
    id(3),
    id(2),
    Quantity.create(2),
    ExpirationDate.create(new Date(Date.now() + 60 * 60 * 1000)),
    StatusVo.pending(),
    Money.create(20),
    Money.create(10),
    DeleteInfoVO.none(),
    Quantity.create(1),
    EffectiveDate.today(),
  );
}

type DeleteCall = { itemId: Id; reason: Reason; actorId: Id };
type PaginateParams = { filter: Record<string, unknown> };

function buildService(item: OrderItemsAggregate) {
  const filters: Record<string, unknown>[] = [];
  const published: unknown[][] = [];
  const deleteCalls: DeleteCall[] = [];
  const recoverCalls: DeleteCall[] = [];
  let confirmCalls = 0;

  const internalService = {
    deleteOrderItem: async (itemId: Id, reason: Reason, actorId: Id) => {
      deleteCalls.push({ itemId, reason, actorId });
      return [{ type: 'order-item.deleted' }];
    },
    recoverOrderItem: async (itemId: Id, actorId: Id) => {
      recoverCalls.push({ itemId, reason: reasonForTest, actorId });
      return [{ type: 'order-item.recovered' }];
    },
    confirmOrderItems: async () => {
      confirmCalls += 1;
      return [];
    },
  };

  const repo = {
    FindPaginated: async (params: PaginateParams) => {
      filters.push(params.filter);
      return { data: [], meta: { nextCursor: null, prevCursor: null, hasMore: false } };
    },
    FindReadModelById: async () => OrderItemsMapper.aggregateToReadModel(item),
    FindResponseById: async () => OrderItemsMapper.aggregateToResponseReadModel(item),
  };

  const vendorQueries = {
    ensureActiveByUserId: async () => ({ vendor: { id: VENDOR_ID.value }, active: true }),
  };

  const eventBus = {
    publish: async (events: unknown[]) => {
      published.push(events);
    },
  };

  const unitOfWork = { transaction: async <T>(run: () => Promise<T>) => run() };

  const service = new OrderItemsApplicationService(
    internalService as never,
    repo as never,
    {} as never,
    vendorQueries as never,
    eventBus as never,
    unitOfWork as never,
  );

  return {
    service,
    filters,
    published,
    deleteCalls,
    recoverCalls,
    confirmCalls: () => confirmCalls,
  };
}

const reasonForTest = Reason.create('damaged packaging during transit');

describe('OrderItemsApplicationService vendor scoping', () => {
  it('scopes the vendor list to the caller vendor and excludes deleted rows', async () => {
    const { service, filters } = buildService(orderItem(VENDOR_ID));

    await service.findVendorPaginatedOrderItems({ limit: 10 } as never, actor);

    expect(filters[0]).toMatchObject({
      vendorId: VENDOR_ID.value,
      'deleted.deleted': false,
    });
  });

  it('keeps the order and status filters the vendor supplied', async () => {
    const { service, filters } = buildService(orderItem(VENDOR_ID));

    await service.findVendorPaginatedOrderItems(
      { orderId: ORDER_ID.value, status: 'pending', limit: 10 } as never,
      actor,
    );

    expect(filters[0]).toMatchObject({
      orderId: ORDER_ID.value,
      status: 'pending',
    });
  });

  it('returns one item when it belongs to the caller vendor', async () => {
    const { service } = buildService(orderItem(VENDOR_ID));

    const item = await service.getVendorOrderItemById(ITEM_ID.value, actor);

    expect(item._id).toBe(ITEM_ID.value);
  });

  it('rejects an item owned by another vendor', async () => {
    const { service } = buildService(orderItem(OTHER_VENDOR_ID));

    await expect(service.getVendorOrderItemById(ITEM_ID.value, actor)).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });

  it('refuses vendor transitions on another vendor item', async () => {
    const { service, confirmCalls } = buildService(orderItem(OTHER_VENDOR_ID));

    await expect(service.vendorConfirmOrderItem(ITEM_ID.value, actor)).rejects.toBeInstanceOf(
      ForbiddenError,
    );
    expect(confirmCalls()).toBe(0);
  });
});

describe('OrderItemsApplicationService admin delete and recover', () => {
  it('soft-deletes the item and publishes the domain event', async () => {
    const { service, deleteCalls, published } = buildService(orderItem(VENDOR_ID));

    await service.deleteOrderItem(ITEM_ID.value, { reason: reasonForTest.value }, actor);

    expect(deleteCalls[0]?.itemId.value).toBe(ITEM_ID.value);
    expect(deleteCalls[0]?.actorId.value).toBe(BUYER_ID.value);
    expect(published).toHaveLength(1);
  });

  it('recovers the item and publishes the domain event', async () => {
    const { service, recoverCalls, published } = buildService(orderItem(VENDOR_ID));

    await service.recoverOrderItem(ITEM_ID.value, actor);

    expect(recoverCalls[0]?.itemId.value).toBe(ITEM_ID.value);
    expect(published).toHaveLength(1);
  });
});
