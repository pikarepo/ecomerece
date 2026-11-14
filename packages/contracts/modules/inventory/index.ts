import type { InventoryReadModel } from '@ecomerece/domain';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';

/** Why a single requested line could not be reserved. */
export type InventoryReservationFailureReason =
  | 'inventory_not_found'
  | 'inventory_deleted'
  | 'out_of_stock'
  | 'insufficient_stock';

/** Per-line outcome of a reservation request, so callers can explain drops. */
export interface InventoryReservationLineResult {
  variantId: Id;
  reserved: boolean;
  reason: InventoryReservationFailureReason | null;
}

export interface InventoryReservationResult {
  validIds: Id[];
  notFoundIds: Id[];
  deletedIds: Id[];
  availableStockIds: Id[];
  soldOutIds: Id[];
  buyableIds: Id[];
  inventoriesReadModel: InventoryReadModel[];
  lines: InventoryReservationLineResult[];
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

  /** Marks confirmed units as sold out. */
  soldOut(items: { variantId: Id; quantity: Quantity }[], actorId: Id): Promise<void>;

  /** Returns sold out units back to available stock on refund/return. */
  unsold(items: { variantId: Id; quantity: Quantity }[], actorId: Id): Promise<void>;
}
