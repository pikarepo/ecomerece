import { describe, expect, it } from 'bun:test';
import { EffectiveDate, ExpirationDate, Id, Money, Quantity, Reason } from '@ecomerece/domain';
import * as contracts from '../index';
import type {
  AuthActor,
  CartOrderResult,
  CreateCartOrderInput,
  EnsureActiveAddressResult,
  EnsureActiveOrderResult,
  EnsureActiveProductResult,
  EnsureActiveUserResult,
  EnsureActiveVariantResult,
  EnsureActiveVendorResult,
  IAddressQueries,
  ICategoryQueries,
  IEntityExistsPort,
  IInventoryReservation,
  IOrderItemsQueries,
  IOrderItemsWriter,
  IOrderQueries,
  IOrderWriter,
  IProductPricingUpdater,
  IProductQueries,
  IProductVariantQueries,
  IProductStockUpdater,
  IStatsAccessPort,
  IUserQueries,
  IVendorQueries,
  InventoryReservationResult,
  VerifyCategoryResult,
  VerifyProductsResult,
  VerifyVariantsResult,
} from '../index';

const id = (n: number) => Id.create(`00000000-0000-7000-8000-${String(n).padStart(12, '0')}`);
const actor: AuthActor = { _id: id(7).value, image: '', name: { fullName: 'Test Buyer' } };
const reason = () => Reason.create('damaged in transit');
const event = (type: string) => ({ type, payload: {}, occurredOn: EffectiveDate.today() });

describe('contracts package surface', () => {
  it('is a type-only package with no runtime exports', () => {
    expect(Object.keys(contracts)).toEqual([]);
  });
});

describe('read port contracts', () => {
  it('implementing IOrderQueries returns the declared result shape', async () => {
    const port: IOrderQueries = {
      ensureActiveById: async (orderId): Promise<EnsureActiveOrderResult> => ({
        order: orderId.equals(id(20)) ? null : null,
        active: orderId.equals(id(20)),
      }),
    };

    expect(await port.ensureActiveById(id(20))).toEqual({ order: null, active: true });
    expect(await port.ensureActiveById(id(21))).toEqual({ order: null, active: false });
  });

  it('implementing IVendorQueries covers the three declared lookups', async () => {
    const port: IVendorQueries = {
      ensureActiveById: async (): Promise<EnsureActiveVendorResult> => ({
        vendor: null,
        active: true,
      }),
      ensureActiveByUserId: async (userId): Promise<EnsureActiveVendorResult> => ({
        vendor: null,
        active: userId.equals(id(7)),
      }),
      getByUserId: async () => null,
    };

    expect(await port.ensureActiveById(id(4))).toEqual({ vendor: null, active: true });
    expect((await port.ensureActiveByUserId(id(7))).active).toBe(true);
    expect(await port.getByUserId(id(7))).toBeNull();
  });

  it('implementing IAddressQueries scopes by both address and user', async () => {
    const port: IAddressQueries = {
      ensureActiveById: async (addressId, userId): Promise<EnsureActiveAddressResult> => ({
        address: null,
        active: addressId.equals(id(500)) && userId.equals(id(7)),
      }),
    };

    expect(await port.ensureActiveById(id(500), id(7))).toEqual({ address: null, active: true });
    expect(await port.ensureActiveById(id(500), id(8))).toEqual({ address: null, active: false });
  });

  it('implementing IUserQueries exposes both the result and boolean forms', async () => {
    const port: IUserQueries = {
      ensureActiveById: async (): Promise<EnsureActiveUserResult> => ({
        user: null,
        active: false,
      }),
      ensureActive: async (userId) => userId.equals(id(7)),
    };

    expect(await port.ensureActiveById(id(7))).toEqual({ user: null, active: false });
    expect(await port.ensureActive(id(7))).toBe(true);
    expect(await port.ensureActive(id(8))).toBe(false);
  });

  it('implementing ICategoryQueries reports validity and the read model', async () => {
    const port: ICategoryQueries = {
      verifyAndGet: async (categoryId): Promise<VerifyCategoryResult> => ({
        isValid: categoryId.equals(id(200)),
        category: null,
      }),
    };

    expect(await port.verifyAndGet(id(200))).toEqual({ isValid: true, category: null });
    expect(await port.verifyAndGet(id(201))).toEqual({ isValid: false, category: null });
  });

  it('implementing IProductQueries returns batches and vendor scoped ids', async () => {
    const port: IProductQueries = {
      ensureActiveById: async (): Promise<EnsureActiveProductResult> => ({
        product: null,
        active: true,
      }),
      verifyAndGet: async (ids): Promise<VerifyProductsResult> => ({
        validIds: ids,
        notFoundIds: [],
        deletedIds: [],
        blockedIds: [],
        productReadModel: [],
      }),
      listVendorProductIds: async (vendorId) => (vendorId.equals(id(4)) ? [id(400)] : []),
    };

    expect(await port.verifyAndGet([id(400)])).toMatchObject({ validIds: [id(400)] });
    expect(await port.listVendorProductIds(id(4))).toEqual([id(400)]);
    expect(await port.listVendorProductIds(id(5))).toEqual([]);
  });

  it('implementing IProductVariantQueries keeps the batch buckets separate', async () => {
    const port: IProductVariantQueries = {
      ensureActiveById: async (): Promise<EnsureActiveVariantResult> => ({
        variant: null,
        active: true,
      }),
      verifyAndGet: async (ids): Promise<VerifyVariantsResult> => ({
        validIds: ids,
        notFoundIds: [],
        deletedIds: [],
        nonActiveIds: [],
        variantReadModel: [],
      }),
      listVariantIdsByProductIds: async (productIds) => productIds.map((productId) => productId),
    };

    expect(await port.verifyAndGet([id(300)])).toMatchObject({ validIds: [id(300)] });
    expect(await port.listVariantIdsByProductIds([id(400)])).toEqual([id(400)]);
  });
});

describe('write port contracts', () => {
  it('implementing IOrderWriter converts domain values into service calls', async () => {
    const calls: string[] = [];
    const result: CartOrderResult = {
      orderId: id(20),
      orderType: 'cart',
      vendorIds: [id(4).value],
      totalPrice: 25,
      createdAt: new Date(),
    };
    const port: IOrderWriter = {
      createFromCart: async (input: CreateCartOrderInput) => {
        calls.push(`create:${input.items.length}`);
        return result;
      },
      returnOrder: async () => {
        calls.push('return');
      },
      refundOrder: async () => {
        calls.push('refund');
      },
      returnOrderAsAdmin: async () => {
        calls.push('return-admin');
      },
      refundOrderAsAdmin: async () => {
        calls.push('refund-admin');
      },
    };

    expect(
      await port.createFromCart({
        idempotentKey: id(2),
        buyerId: id(7),
        addressId: id(500),
        waitingTime: ExpirationDate.fromDays(1),
        items: [{ variantId: id(301), quantity: Quantity.create(1) }],
      }),
    ).toEqual(result);
    await port.returnOrder(id(20), reason(), actor);
    await port.refundOrderAsAdmin(id(20), reason(), actor);
    expect(calls).toEqual(['create:1', 'return', 'refund-admin']);
  });

  it('implementing IOrderItemsWriter returns the events it produced', async () => {
    const port: IOrderItemsWriter = {
      create: async (items) => items.map(() => event('order-item.created')),
      cancel: async (items) => items.map(() => event('order-item.cancelled')),
      update: async (items) => items.map(() => event('order-item.updated')),
      confirm: async (items) => items.map(() => event('order-item.confirmed')),
      complete: async (items) => items.map(() => event('order-item.completed')),
      returnItems: async (items) => items.map(() => event('order-item.returned')),
      refund: async (items) => items.map(() => event('order-item.refunded')),
      recordFailures: async (items) => items.map(() => event('order-item.created')),
      restoreFailures: async (items) => items.map(() => event('order-item.updated')),
    };

    const events = await port.create([]);
    expect(events).toEqual([]);
    expect(await port.confirm([{ id: id(30) }])).toHaveLength(1);
  });

  it('implementing IOrderItemsQueries returns scoped lists', async () => {
    const port: IOrderItemsQueries = {
      getByOrderId: async () => [],
      getByVendorId: async () => [],
      getFailedByOrderId: async () => [],
      getFailedById: async () => null,
    };

    expect(await port.getByOrderId(id(20))).toEqual([]);
    expect(await port.getFailedById(id(30))).toBeNull();
  });

  it('implementing IInventoryReservation keeps per-line results aligned', async () => {
    const port: IInventoryReservation = {
      reserve: async (items): Promise<InventoryReservationResult> => ({
        validIds: items.map((item) => item.variantId),
        notFoundIds: [],
        deletedIds: [],
        availableStockIds: items.map((item) => item.variantId),
        soldOutIds: [],
        buyableIds: items.map((item) => item.variantId),
        inventoriesReadModel: [],
        lines: items.map((item) => ({
          variantId: item.variantId,
          reserved: true,
          reason: null,
        })),
      }),
      complete: async () => {},
      release: async () => {},
      restock: async () => {},
      soldOut: async () => {},
      unsold: async () => {},
    };

    const result = await port.reserve(
      [
        { variantId: id(301), quantity: Quantity.create(1) },
        { variantId: id(302), quantity: Quantity.create(2) },
      ],
      id(7),
    );

    expect(result.lines.map((line) => line.variantId.value)).toEqual([
      id(301).value,
      id(302).value,
    ]);
    expect(result.lines.every((line) => line.reserved && line.reason === null)).toBe(true);
  });
});

describe('updater and access port contracts', () => {
  it('implementing IProductStockUpdater and IProductPricingUpdater returns ok', async () => {
    const stock: IProductStockUpdater = {
      setInStock: async (productId, inStock) => ({ ok: productId.equals(id(400)) && inStock }),
    };
    const pricing: IProductPricingUpdater = {
      updatePrice: async () => ({ ok: true }),
    };

    expect(await stock.setInStock(id(400), true, id(4))).toEqual({ ok: true });
    expect(await stock.setInStock(id(400), false, id(4))).toEqual({ ok: false });
    expect(
      await pricing.updatePrice(
        id(400),
        {
          minPrice: Money.create(1),
          maxPrice: Money.create(2),
          minDiscountedPrice: Money.create(1),
          maxDiscountedPrice: Money.create(2),
        },
        id(4),
      ),
    ).toEqual({ ok: true });
  });

  it('implementing the stats access and existence ports', async () => {
    const access: IStatsAccessPort = {
      getProductVendorId: async (productId) => (productId === id(400).value ? id(4).value : null),
      getVendorIdByOwnerId: async (ownerId) => (ownerId === id(7).value ? id(4).value : null),
    };
    const exists: IEntityExistsPort = {
      Exists: async (entityId) => entityId.equals(id(400)),
    };

    expect(await access.getProductVendorId(id(400).value)).toBe(id(4).value);
    expect(await access.getProductVendorId('missing')).toBeNull();
    expect(await access.getVendorIdByOwnerId(id(7).value)).toBe(id(4).value);
    expect(await exists.Exists(id(400))).toBe(true);
    expect(await exists.Exists(id(401))).toBe(false);
  });
});
