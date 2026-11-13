import type { InventoryReadModel } from '@ecomerece/domain';
import type {
  InventoryReservationFailureReason,
  InventoryReservationLineResult,
  InventoryReservationResult,
} from '@ecomerece/contracts';
import type { OrderItem } from '@ecomerece/domain/modules/order/value-objects/order-item.vo';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import { BaseService } from '../../../core/services/base.services';
import { InventoryMapper } from '../infrastructure/inventory.mapper';
import type { InventoryReposityory } from '../infrastructure/inventory.repository';

export class InventoryInternalServcie extends BaseService {
  constructor(private readonly inventoryRepo: InventoryReposityory) {
    super();
  }

  async getInventoryById(id: Id): Promise<InventoryReadModel | null> {
    const inventory = await this.inventoryRepo.FindById(id);
    if (!inventory) return null;
    return InventoryMapper.aggregateToReadModel(inventory);
  }

  async getInventoryByVariantId(variantId: Id): Promise<InventoryReadModel | null> {
    const inventory = await this.inventoryRepo.FindByVariantId(variantId);
    if (!inventory) return null;
    return InventoryMapper.aggregateToReadModel(inventory);
  }

  async verifyInventoriesItemsGet(inventoryItems: OrderItem[]): Promise<{
    validIds: Id[];
    notFoundIds: Id[];
    deletedIds: Id[];
    availableStockIds: Id[];
    buyableIds: Id[];
    inventoriesReadModel: InventoryReadModel[];
  }> {
    const variantIds = inventoryItems.map((item) => Id.create(item.variantId.value));
    const inventories = await this.inventoryRepo.FindByVariantIds(variantIds);
    const validInventories = inventories.filter((inv) => !inv.delete.deleted);
    const validIdValues = new Set(validInventories.map((inv) => inv.variantId.value));
    const existingInventoryVariantIds = new Set(inventories.map((inv) => inv.variantId.value));
    const foundIds = variantIds.filter((id) => existingInventoryVariantIds.has(id.value));
    const notFoundIds = variantIds.filter((id) => !existingInventoryVariantIds.has(id.value));
    const deletedIds = inventories
      .filter((inv) => inv.delete.deleted)
      .map((inv) => Id.create(inv.variantId.value));
    const validIds = foundIds.filter((id) => validIdValues.has(id.value));
    const availableStockIds = validInventories
      .filter((inv) => inv.available.value > 0)
      .map((inv) => Id.create(inv.variantId.value));
    const buyableIds = availableStockIds;
    const inventoriesReadModel = validInventories.map((inv) =>
      InventoryMapper.aggregateToReadModel(inv),
    );
    return {
      validIds,
      notFoundIds,
      deletedIds,
      availableStockIds,
      buyableIds,
      inventoriesReadModel,
    };
  }
  /**
   * Applies a reserved-stock transition to every line the order owns.
   * Deleted inventories are skipped rather than failing the batch, matching
   * the reserve path's tolerance for unavailable rows.
   */
  private async transitionReserved(
    items: { variantId: Id; quantity: Quantity }[],
    actorId: Id,
    apply: 'complete' | 'release' | 'restock',
  ): Promise<InventoryReadModel[]> {
    if (items.length === 0) return [];
    const inventories = await this.inventoryRepo.FindByVariantIds(
      items.map((item) => item.variantId),
    );
    const itemsByVariant = new Map(items.map((item) => [item.variantId.value, item] as const));
    const changed = inventories.filter((inventory) => {
      const item = itemsByVariant.get(inventory.variantId.value);
      return Boolean(item) && !inventory.delete.deleted;
    });

    for (const inventory of changed) {
      const item = itemsByVariant.get(inventory.variantId.value)!;
      if (apply === 'complete') inventory.complete(item.quantity, actorId);
      else if (apply === 'release') inventory.release(item.quantity, actorId);
      else inventory.restock(item.quantity, actorId);
    }
    await this.inventoryRepo.SaveMany(changed);
    return changed.map((inventory) => InventoryMapper.aggregateToReadModel(inventory));
  }

  completeInventories(
    items: { variantId: Id; quantity: Quantity }[],
    actorId: Id,
  ): Promise<InventoryReadModel[]> {
    return this.transitionReserved(items, actorId, 'complete');
  }

  releaseInventories(
    items: { variantId: Id; quantity: Quantity }[],
    actorId: Id,
  ): Promise<InventoryReadModel[]> {
    return this.transitionReserved(items, actorId, 'release');
  }

  restockInventories(
    items: { variantId: Id; quantity: Quantity }[],
    actorId: Id,
  ): Promise<InventoryReadModel[]> {
    return this.transitionReserved(items, actorId, 'restock');
  }

  /**
   * Reserves every line that has enough stock and reports why the rest could
   * not be reserved.
   *
   * A short line no longer aborts the batch (the old `available > 0` check let
   * `inventory.reserve` throw `Insufficient quantity`): the caller decides
   * whether a rejection fails the whole order or is recorded on the item.
   */
  async reserveInventories(
    inventoryItems: { variantId: Id; quantity: Quantity }[],
    actorId: Id,
  ): Promise<InventoryReservationResult> {
    const variantIds = inventoryItems.map((item) => Id.create(item.variantId.value));
    const inventories = await this.inventoryRepo.FindByVariantIds(variantIds);
    const inventoryByVariant = new Map(
      inventories.map((inventory) => [inventory.variantId.value, inventory] as const),
    );

    const lines: InventoryReservationLineResult[] = [];
    // Keyed by variant so a variant requested twice is only saved once.
    const reserved = new Map<string, (typeof inventories)[number]>();

    for (const item of inventoryItems) {
      const inventory = inventoryByVariant.get(item.variantId.value);
      const reason: InventoryReservationFailureReason | null = !inventory
        ? 'inventory_not_found'
        : inventory.delete.deleted
          ? 'inventory_deleted'
          : inventory.available.value === 0
            ? 'out_of_stock'
            : inventory.available.value < item.quantity.value
              ? 'insufficient_stock'
              : null;

      if (!inventory || reason) {
        lines.push({ variantId: item.variantId, reserved: false, reason });
        continue;
      }

      inventory.reserve(item.quantity, actorId);
      reserved.set(inventory.variantId.value, inventory);
      lines.push({ variantId: item.variantId, reserved: true, reason: null });
    }

    await this.inventoryRepo.SaveMany([...reserved.values()]);

    const validInventories = inventories.filter((inv) => !inv.delete.deleted);
    const validIdValues = new Set(validInventories.map((inv) => inv.variantId.value));
    const existingInventoryVariantIds = new Set(inventories.map((inv) => inv.variantId.value));
    const foundIds = variantIds.filter((id) => existingInventoryVariantIds.has(id.value));
    const notFoundIds = variantIds.filter((id) => !existingInventoryVariantIds.has(id.value));
    const deletedIds = inventories
      .filter((inv) => inv.delete.deleted)
      .map((inv) => Id.create(inv.variantId.value));
    const validIds = foundIds.filter((id) => validIdValues.has(id.value));
    const availableStockIds = validInventories
      .filter((inv) => inv.available.value > 0)
      .map((inv) => Id.create(inv.variantId.value));
    const buyableIds = lines.filter((line) => line.reserved).map((line) => line.variantId);
    const inventoriesReadModel = validInventories.map((inv) =>
      InventoryMapper.aggregateToReadModel(inv),
    );

    return {
      validIds,
      notFoundIds,
      deletedIds,
      availableStockIds,
      buyableIds,
      inventoriesReadModel,
      lines,
    };
  }
}
