import { describe, expect, it } from 'bun:test';
import { BadRequestError } from '../../errors/app-error';
import { DeleteInfoVO, Id, Quantity, Reason } from '../../value-objects';
import { InventoryAggregate } from '../inventory/inventory.aggregate';

const id = (n: number) => Id.create(`00000000-0000-7000-8000-${String(n).padStart(12, '0')}`);
const reason = () => Reason.create('violates the marketplace policy');
const quantity = (n: number) => Quantity.create(n);

function inventory(available = 5, threshold = 2) {
  return InventoryAggregate.create({
    id: id(600),
    variantId: id(301),
    lowStockThreshold: quantity(threshold),
    available: quantity(available),
  });
}

function allocated() {
  const aggregate = inventory(5);
  aggregate.reserve(quantity(3), id(9));
  aggregate.clearEvents();
  return aggregate;
}

describe('InventoryAggregate creation', () => {
  it('starts with the given availability and no held or sold-out units', () => {
    const aggregate = inventory(5, 2);

    expect(aggregate.available.value).toBe(5);
    expect(aggregate.reserved.value).toBe(0);
    expect(aggregate.soldOut.value).toBe(0);
    expect(aggregate.lowStockThreshold.value).toBe(2);
    expect(aggregate.delete.isDeleted).toBe(false);
    expect(aggregate.pullEvents().map((event) => event.type)).toEqual(['inventory.created']);
  });

  it('rehydrates legacy rows without sold-out units', () => {
    const legacy = InventoryAggregate.rehydrateLegacy(
      id(601),
      id(301),
      quantity(4),
      quantity(1),
      quantity(2),
      DeleteInfoVO.none(),
      quantity(0),
      inventory().createdAt,
    );

    expect(legacy.available.value).toBe(4);
    expect(legacy.reserved.value).toBe(1);
    expect(legacy.soldOut.value).toBe(0);
  });
});

describe('InventoryAggregate allocation', () => {
  it('moves stock from available to reserved on reserve', () => {
    const aggregate = inventory(5);

    aggregate.reserve(quantity(2), id(9));

    expect(aggregate.available.value).toBe(3);
    expect(aggregate.reserved.value).toBe(2);
    expect(aggregate.pullEvents().at(-1)?.type).toBe('inventory.reserved');
  });

  it('refuses to reserve more than is available', () => {
    const aggregate = inventory(2);

    expect(() => aggregate.reserve(quantity(3), id(9))).toThrow(BadRequestError);
  });

  it('releases held units back to available', () => {
    const aggregate = allocated();

    aggregate.release(quantity(2), id(9));

    expect(aggregate.reserved.value).toBe(1);
    expect(aggregate.available.value).toBe(4);
    expect(aggregate.pullEvents().at(-1)?.type).toBe('inventory.released');
  });

  it('refuses to release more than is reserved', () => {
    expect(() => allocated().release(quantity(4), id(9))).toThrow(BadRequestError);
  });

  it('moves held units to sold out when items are confirmed', () => {
    const aggregate = allocated();

    aggregate.markSoldOut(quantity(2), id(9));

    expect(aggregate.reserved.value).toBe(1);
    expect(aggregate.soldOut.value).toBe(2);
    expect(aggregate.available.value).toBe(2);
    expect(aggregate.pullEvents().at(-1)?.type).toBe('inventory.sold-out');
  });

  it('refuses to sell out more units than are reserved', () => {
    expect(() => allocated().markSoldOut(quantity(4), id(9))).toThrow(BadRequestError);
  });

  it('moves held units to sold out on complete', () => {
    const aggregate = allocated();

    aggregate.complete(quantity(1), id(9));

    expect(aggregate.reserved.value).toBe(2);
    expect(aggregate.soldOut.value).toBe(1);
    expect(aggregate.pullEvents().at(-1)?.type).toBe('inventory.completed');
  });

  it('refuses to complete more units than are reserved', () => {
    expect(() => allocated().complete(quantity(4), id(9))).toThrow(BadRequestError);
  });
});

describe('InventoryAggregate stock adjustments', () => {
  it('restocks already-consumed units into available', () => {
    const aggregate = allocated();
    aggregate.markSoldOut(quantity(3), id(9));
    aggregate.clearEvents();

    aggregate.restock(quantity(2), id(9));

    expect(aggregate.available.value).toBe(4);
    expect(aggregate.soldOut.value).toBe(3);
    expect(aggregate.pullEvents().at(-1)?.type).toBe('inventory.restocked');
  });

  it('returns sold-out units to available on unsold', () => {
    const aggregate = allocated();
    aggregate.markSoldOut(quantity(3), id(9));
    aggregate.clearEvents();

    aggregate.unsold(quantity(2), id(9));

    expect(aggregate.soldOut.value).toBe(1);
    expect(aggregate.available.value).toBe(4);
    expect(aggregate.pullEvents().at(-1)?.type).toBe('inventory.restocked');
  });

  it('refuses to unsell more units than are sold out', () => {
    expect(() => allocated().unsold(quantity(1), id(9))).toThrow(BadRequestError);
  });

  it('increases available on buy', () => {
    const aggregate = inventory(5);
    aggregate.clearEvents();

    aggregate.buy(quantity(4), id(9));

    expect(aggregate.available.value).toBe(9);
    expect(aggregate.pullEvents().at(-1)?.type).toBe('inventory.bought');
  });

  it('removes stock from available', () => {
    const aggregate = inventory(5);
    aggregate.clearEvents();

    aggregate.removeStock(quantity(2), id(9));

    expect(aggregate.available.value).toBe(3);
    expect(aggregate.pullEvents().at(-1)?.type).toBe('inventory.stock-removed');
  });

  it('refuses to remove more stock than is available', () => {
    expect(() => inventory(2).removeStock(quantity(3), id(9))).toThrow(BadRequestError);
  });

  it('updates the low stock threshold with its own event', () => {
    const aggregate = inventory(5, 2);
    aggregate.clearEvents();

    aggregate.updateLowStockThreshold(quantity(4), id(9));

    expect(aggregate.lowStockThreshold.value).toBe(4);
    expect(aggregate.pullEvents().at(-1)?.type).toBe('inventory.low-stock-threshold-updated');
  });
});

describe('InventoryAggregate deletion', () => {
  function emptyInventory() {
    return inventory(0);
  }

  it('deletes an empty inventory and raises one event', () => {
    const aggregate = emptyInventory();
    aggregate.clearEvents();

    aggregate.deleteInventory(reason(), id(9));

    expect(aggregate.delete.isDeleted).toBe(true);
    const [event] = aggregate.pullEvents();
    expect(event?.type).toBe('inventory.deleted');
    expect(event?.payload).toMatchObject({ actorId: id(9), deletionInfo: aggregate.delete });
  });

  it('refuses to delete while stock is still allocated', () => {
    expect(() => inventory(1).deleteInventory(reason(), id(9))).toThrow(
      'Clear the available stock before deleting this inventory.',
    );

    const reserved = inventory(3);
    reserved.reserve(quantity(3), id(9));
    expect(() => reserved.deleteInventory(reason(), id(9))).toThrow(
      'Clear the reserved stock before deleting this inventory.',
    );

    const sold = inventory(3);
    sold.reserve(quantity(3), id(9));
    sold.markSoldOut(quantity(3), id(9));
    expect(() => sold.deleteInventory(reason(), id(9))).toThrow(
      'Clear the sold-out stock before deleting this inventory.',
    );
  });

  it('refuses a second delete', () => {
    const aggregate = emptyInventory();
    aggregate.deleteInventory(reason(), id(9));

    expect(() => aggregate.deleteInventory(reason(), id(9))).toThrow(
      'This inventory has already been deleted.',
    );
  });

  it('blocks every stock operation once deleted', () => {
    const aggregate = emptyInventory();
    aggregate.deleteInventory(reason(), id(9));

    expect(() => aggregate.reserve(quantity(1), id(9))).toThrow(BadRequestError);
    expect(() => aggregate.markSoldOut(quantity(1), id(9))).toThrow(BadRequestError);
    expect(() => aggregate.complete(quantity(1), id(9))).toThrow(BadRequestError);
    expect(() => aggregate.release(quantity(1), id(9))).toThrow(BadRequestError);
    expect(() => aggregate.restock(quantity(1), id(9))).toThrow(BadRequestError);
    expect(() => aggregate.unsold(quantity(1), id(9))).toThrow(BadRequestError);
    expect(() => aggregate.buy(quantity(1), id(9))).toThrow(BadRequestError);
    expect(() => aggregate.removeStock(quantity(1), id(9))).toThrow(BadRequestError);
    expect(() => aggregate.updateLowStockThreshold(quantity(1), id(9))).toThrow(BadRequestError);
  });
});
