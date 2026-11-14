import { describe, expect, it } from 'bun:test';
import { InventoryAggregate } from '@ecomerece/domain/modules/inventory/inventory.aggregate';
import { DeleteInfoVO } from '@ecomerece/domain/value-objects/delete-info.vo';
import { EffectiveDate } from '@ecomerece/domain/value-objects/effective-date.vo';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import { InventoryInternalServcie } from '../inventory.internal.service';

const id = (n: number) => Id.create(`00000000-0000-7000-8000-${String(n).padStart(12, '0')}`);

function inventory(variantNumber: number, available: number, reserved: number, deleted = false) {
  return InventoryAggregate.rehydrate(
    id(100 + variantNumber),
    id(variantNumber),
    Quantity.create(available),
    Quantity.create(reserved),
    Quantity.create(2),
    deleted ? DeleteInfoVO.rehydrate(null, true, null, null) : DeleteInfoVO.none(),
    Quantity.none(),
    EffectiveDate.today(),
  );
}

function buildService(inventories: InventoryAggregate[]) {
  const saved: InventoryAggregate[] = [];
  const service = new InventoryInternalServcie({
    FindByVariantIds: async (variantIds: Id[]) =>
      inventories.filter((item) =>
        variantIds.some((variantId) => variantId.value === item.variantId.value),
      ),
    SaveMany: async (items: InventoryAggregate[]) => {
      saved.push(...items);
    },
  } as never);
  return { service, saved };
}

const actorId = id(1);

describe('InventoryInternalServcie reserved-stock transitions', () => {
  it('consumes held stock on complete without returning it to available', async () => {
    const stock = inventory(2, 10, 5);
    const { service, saved } = buildService([stock]);

    await service.completeInventories(
      [{ variantId: id(2), quantity: Quantity.create(2) }],
      actorId,
    );

    expect(stock.available.value).toBe(10);
    expect(stock.reserved.value).toBe(3);
    expect(saved).toHaveLength(1);
  });

  it('returns held stock to available on release', async () => {
    const stock = inventory(2, 10, 5);
    const { service, saved } = buildService([stock]);

    await service.releaseInventories([{ variantId: id(2), quantity: Quantity.create(2) }], actorId);

    expect(stock.available.value).toBe(12);
    expect(stock.reserved.value).toBe(3);
    expect(saved).toHaveLength(1);
  });

  it('returns fulfilled stock to available on restock without touching reserved', async () => {
    const stock = inventory(2, 10, 0);
    const { service, saved } = buildService([stock]);

    await service.restockInventories([{ variantId: id(2), quantity: Quantity.create(2) }], actorId);

    expect(stock.available.value).toBe(12);
    expect(stock.reserved.value).toBe(0);
    expect(saved).toHaveLength(1);
  });

  it('applies each line to its own variant', async () => {
    const first = inventory(2, 10, 5);
    const second = inventory(3, 4, 2);
    const { service } = buildService([first, second]);

    await service.releaseInventories(
      [
        { variantId: id(2), quantity: Quantity.create(1) },
        { variantId: id(3), quantity: Quantity.create(2) },
      ],
      actorId,
    );

    expect(first.available.value).toBe(11);
    expect(first.reserved.value).toBe(4);
    expect(second.available.value).toBe(6);
    expect(second.reserved.value).toBe(0);
  });

  it('skips deleted inventories and does not persist them', async () => {
    const live = inventory(2, 10, 5);
    const deleted = inventory(3, 4, 2, true);
    const { service, saved } = buildService([live, deleted]);

    await service.releaseInventories(
      [
        { variantId: id(2), quantity: Quantity.create(1) },
        { variantId: id(3), quantity: Quantity.create(1) },
      ],
      actorId,
    );

    expect(live.reserved.value).toBe(4);
    expect(deleted.available.value).toBe(4);
    expect(deleted.reserved.value).toBe(2);
    expect(saved).toEqual([live]);
  });

  it('does not write when there are no order lines', async () => {
    const { service, saved } = buildService([inventory(2, 10, 5)]);

    await service.releaseInventories([], actorId);

    expect(saved).toHaveLength(0);
  });
});

describe('InventoryInternalServcie.reserveInventories', () => {
  it('reports the precise reason each line could not be reserved', async () => {
    const { service } = buildService([
      inventory(2, 10, 0, true),
      inventory(3, 0, 0),
      inventory(4, 1, 0),
    ]);

    const result = await service.reserveInventories(
      [
        { variantId: id(99), quantity: Quantity.create(1) },
        { variantId: id(2), quantity: Quantity.create(1) },
        { variantId: id(3), quantity: Quantity.create(1) },
        { variantId: id(4), quantity: Quantity.create(2) },
      ],
      actorId,
    );

    expect(result.lines.map((line) => line.reason)).toEqual([
      'inventory_not_found',
      'inventory_deleted',
      'out_of_stock',
      'insufficient_stock',
    ]);
    expect(result.buyableIds).toEqual([]);
  });

  it('reserves only lines with enough stock and persists them', async () => {
    const available = inventory(2, 10, 0);
    const { service, saved } = buildService([available]);

    const result = await service.reserveInventories(
      [{ variantId: id(2), quantity: Quantity.create(3) }],
      actorId,
    );

    expect(result.lines).toEqual([{ variantId: id(2), reserved: true, reason: null }]);
    expect(result.buyableIds.map((variantId) => variantId.value)).toEqual([id(2).value]);
    expect(available.reserved.value).toBe(3);
    expect(available.available.value).toBe(7);
    expect(saved).toEqual([available]);
  });
});
