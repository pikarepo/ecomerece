import type { InventoryReadModel } from '@ecomerece/domain';
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
  async reserveInventories(
    inventoryItems: { variantId: Id; quantity: Quantity }[],
    actorId: Id,
  ): Promise<{
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
    const buyableInventories = inventories.filter((inv) =>
      buyableIds.some((id) => id.value === inv.variantId.value),
    );

    const itemsByVariant = new Map(
      inventoryItems.map((item) => [item.variantId.value, item] as const),
    );

    for (const inventory of buyableInventories) {
      const item = itemsByVariant.get(inventory.variantId.value);
      if (!item) continue;
      inventory.reserve(item.quantity, actorId);
    }
    await this.inventoryRepo.SaveMany(buyableInventories);
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
}
