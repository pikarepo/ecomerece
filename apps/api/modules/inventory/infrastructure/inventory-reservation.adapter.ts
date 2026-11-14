import type {
  IInventoryReservation,
  InventoryReservationResult,
  IProductStockUpdater,
  IProductVariantQueries,
} from '@ecomerece/contracts';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import type { InventoryInternalServcie } from '../application/inventory.internal.service';

export class InventoryReservationAdapter implements IInventoryReservation {
  constructor(
    private readonly inventoryService: InventoryInternalServcie,
    private readonly variantQueries: IProductVariantQueries,
    private readonly productStock: IProductStockUpdater,
  ) {}

  async reserve(
    items: { variantId: Id; quantity: Quantity }[],
    actorId: Id,
  ): Promise<InventoryReservationResult> {
    const result = await this.inventoryService.reserveInventories(items, actorId);
    await this.syncProductStock(result.inventoriesReadModel, actorId);
    return result;
  }

  async complete(items: { variantId: Id; quantity: Quantity }[], actorId: Id): Promise<void> {
    await this.inventoryService.completeInventories(items, actorId);
  }

  async release(items: { variantId: Id; quantity: Quantity }[], actorId: Id): Promise<void> {
    const inventories = await this.inventoryService.releaseInventories(items, actorId);
    await this.syncProductStock(inventories, actorId);
  }

  async restock(items: { variantId: Id; quantity: Quantity }[], actorId: Id): Promise<void> {
    const inventories = await this.inventoryService.restockInventories(items, actorId);
    await this.syncProductStock(inventories, actorId);
  }

  private async syncProductStock(
    inventories: { variantId: string; available: number }[],
    actorId: Id,
  ): Promise<void> {
    for (const inventory of inventories) {
      const activeVariant = await this.variantQueries.ensureActiveById(
        Id.create(inventory.variantId),
      );
      if (!activeVariant.variant) continue;
      await this.productStock.setInStock(
        Id.create(activeVariant.variant.productId),
        inventory.available > 0,
        actorId,
        { publish: false },
      );
    }
  }
}
