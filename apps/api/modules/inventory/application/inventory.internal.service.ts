import type {
  InventoryReservationFailureReason,
  InventoryReservationLineResult,
  InventoryReservationResult,
} from '@ecomerece/contracts';
import type { InventoryAggregate, InventoryReadModel } from '@ecomerece/domain';
import type { OrderItem } from '@ecomerece/domain/modules/order/value-objects/order-item.vo';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import { BaseService } from '../../../core/services/base.services';
import { InventoryMapper } from '../infrastructure/inventory.mapper';
import type { InventoryReposityory } from '../infrastructure/inventory.repository';

type InventorySummary = Pick<
  InventoryReservationResult,
  'validIds' | 'notFoundIds' | 'deletedIds' | 'availableStockIds' | 'inventoriesReadModel'
>;

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

  async verifyInventoriesItemsGet(
    inventoryItems: OrderItem[],
  ): Promise<InventorySummary & { buyableIds: Id[] }> {
    const variantIds = inventoryItems.map((item) => Id.create(item.variantId.value));
    const inventories = await this.inventoryRepo.FindByVariantIds(variantIds);
    const summary = this.summarizeInventories(inventories, variantIds);

    return { ...summary, buyableIds: summary.availableStockIds };
  }

  /** Splits a batch read into the id sets every inventory consumer needs. */
  private summarizeInventories(
    inventories: InventoryAggregate[],
    requestedVariantIds: Id[],
  ): InventorySummary {
    const validInventories = inventories.filter((inventory) => !inventory.delete.deleted);
    const existingVariantIds = new Set(inventories.map((inventory) => inventory.variantId.value));
    const validVariantIds = new Set(validInventories.map((inventory) => inventory.variantId.value));

    return {
      validIds: requestedVariantIds.filter((id) => validVariantIds.has(id.value)),
      notFoundIds: requestedVariantIds.filter((id) => !existingVariantIds.has(id.value)),
      deletedIds: inventories
        .filter((inventory) => inventory.delete.deleted)
        .map((inventory) => Id.create(inventory.variantId.value)),
      availableStockIds: validInventories
        .filter((inventory) => inventory.available.value > 0)
        .map((inventory) => Id.create(inventory.variantId.value)),
      inventoriesReadModel: validInventories.map((inventory) =>
        InventoryMapper.aggregateToReadModel(inventory),
      ),
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
    const changed = inventories.flatMap((inventory) => {
      const item = itemsByVariant.get(inventory.variantId.value);
      return item && !inventory.delete.deleted ? [{ inventory, item }] : [];
    });

    for (const { inventory, item } of changed) {
      if (apply === 'complete') inventory.complete(item.quantity, actorId);
      else if (apply === 'release') inventory.release(item.quantity, actorId);
      else inventory.restock(item.quantity, actorId);
    }

    await this.inventoryRepo.SaveMany(changed.map(({ inventory }) => inventory));
    return changed.map(({ inventory }) => InventoryMapper.aggregateToReadModel(inventory));
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
      const reason = this.reservationFailureReason(inventory, item.quantity);

      if (!inventory || reason) {
        lines.push({ variantId: item.variantId, reserved: false, reason });
        continue;
      }

      inventory.reserve(item.quantity, actorId);
      reserved.set(inventory.variantId.value, inventory);
      lines.push({ variantId: item.variantId, reserved: true, reason: null });
    }

    await this.inventoryRepo.SaveMany([...reserved.values()]);

    const summary = this.summarizeInventories(inventories, variantIds);
    const buyableIds = lines.filter((line) => line.reserved).map((line) => line.variantId);

    return {
      ...summary,
      buyableIds,
      lines,
    };
  }

  private reservationFailureReason(
    inventory: InventoryAggregate | undefined,
    quantity: Quantity,
  ): InventoryReservationFailureReason | null {
    if (!inventory) return 'inventory_not_found';
    if (inventory.delete.deleted) return 'inventory_deleted';
    if (inventory.available.value === 0) return 'out_of_stock';
    if (inventory.available.value < quantity.value) return 'insufficient_stock';
    return null;
  }
}
