import type { IInventoryReservation, InventoryReservationResult } from '@ecomerece/contracts';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import type { InventoryInternalServcie } from '../application/inventory.internal.service';

export class InventoryReservationAdapter implements IInventoryReservation {
  constructor(private readonly inventoryService: InventoryInternalServcie) {}

  reserve(
    items: { variantId: Id; quantity: Quantity }[],
    actorId: Id,
  ): Promise<InventoryReservationResult> {
    return this.inventoryService.reserveInventories(items, actorId);
  }
}
