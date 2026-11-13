import type { InventoryReadModel } from '@ecomerece/domain';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';

export interface InventoryReservationResult {
  validIds: Id[];
  notFoundIds: Id[];
  deletedIds: Id[];
  availableStockIds: Id[];
  buyableIds: Id[];
  inventoriesReadModel: InventoryReadModel[];
}

export interface IInventoryReservation {
  reserve(
    items: { variantId: Id; quantity: Quantity }[],
    actorId: Id,
  ): Promise<InventoryReservationResult>;

  /** Consumes held stock for fulfilled order lines. */
  complete(items: { variantId: Id; quantity: Quantity }[], actorId: Id): Promise<void>;

  /** Returns a held reservation to available stock (cancel before fulfilment). */
  release(items: { variantId: Id; quantity: Quantity }[], actorId: Id): Promise<void>;

  /** Returns fulfilled stock to available stock (return after fulfilment). */
  restock(items: { variantId: Id; quantity: Quantity }[], actorId: Id): Promise<void>;
}
