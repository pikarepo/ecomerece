import { AggregateRoot } from '../../aggregate-root';
import { BadRequestError } from '../../errors/app-error';
import { DeleteInfoVO, EffectiveDate, type Id, Quantity, type Reason } from '../../value-objects';
import { InventoryBoughtEvent } from './events/inventory-bought.event';
import { InventoryCompletedEvent } from './events/inventory-completed.event';
import { InventoryCreatedEvent } from './events/inventory-created.event';
import { InventoryDeletedEvent } from './events/inventory-deleted.event';
import { InventoryLowStockThresholdUpdatedEvent } from './events/inventory-low-stock-threshold-updated.event';
import { InventoryReleasedEvent } from './events/inventory-released.event';
import { InventoryReservedEvent } from './events/inventory-reserved.event';
import { InventoryRestockedEvent } from './events/inventory-restocked.event';
import { InventorySoldOutEvent } from './events/inventory-sold-out.event';
import { InventoryStockRemovedEvent } from './events/inventory-stock-removed.event';

type createInventoryProps = {
  id: Id;
  variantId: Id;
  lowStockThreshold: Quantity;
  available: Quantity;
};

export class InventoryAggregate extends AggregateRoot {
  constructor(
    private readonly _id: Id,
    private readonly _variantId: Id,
    private _available: Quantity,
    private _reserved: Quantity,
    private _soldOut: Quantity,
    private _lowStockThreshold: Quantity,
    private _delete: DeleteInfoVO,
    private readonly _version: Quantity,
    private readonly _createdAt: EffectiveDate,
  ) {
    super();
  }

  get id() {
    return this._id;
  }
  get variantId() {
    return this._variantId;
  }
  get available() {
    return this._available;
  }
  get reserved() {
    return this._reserved;
  }
  get soldOut() {
    return this._soldOut;
  }
  get lowStockThreshold() {
    return this._lowStockThreshold;
  }
  get version() {
    return this._version;
  }
  get delete() {
    return this._delete;
  }
  get createdAt() {
    return this._createdAt;
  }

  static create(data: createInventoryProps): InventoryAggregate {
    const inventory = new InventoryAggregate(
      data.id,
      data.variantId,
      data.available,

      Quantity.none(),
      Quantity.none(),
      data.lowStockThreshold,
      DeleteInfoVO.none(),
      Quantity.none(),
      EffectiveDate.today(),
    );
    inventory.raise(
      new InventoryCreatedEvent({ inventoryId: inventory._id, variantId: inventory._variantId }),
    );

    return inventory;
  }

  static rehydrate(
    _id: Id,
    _variantId: Id,
    _available: Quantity,
    _reserved: Quantity,
    _soldOut: Quantity,
    _lowStockThreshold: Quantity,
    _delete: DeleteInfoVO,
    _version: Quantity,
    _createdAt: EffectiveDate,
  ): InventoryAggregate {
    return new InventoryAggregate(
      _id,
      _variantId,
      _available,
      _reserved,
      _soldOut,
      _lowStockThreshold,
      _delete,
      _version,
      _createdAt,
    );
  }

  /**
   * Rehydrates an inventory row created before sold-out tracking existed.
   * Old rows have no sold-out units, because sold out is derived from confirm
   * and refunded/returned transitions going forward.
   */
  static rehydrateLegacy(
    _id: Id,
    _variantId: Id,
    _available: Quantity,
    _reserved: Quantity,
    _lowStockThreshold: Quantity,
    _delete: DeleteInfoVO,
    _version: Quantity,
    _createdAt: EffectiveDate,
  ): InventoryAggregate {
    return InventoryAggregate.rehydrate(
      _id,
      _variantId,
      _available,
      _reserved,
      Quantity.none(),
      _lowStockThreshold,
      _delete,
      _version,
      _createdAt,
    );
  }

  reserve(quantity: Quantity, _actorId: Id) {
    this.ensureNotDeleted();
    this._reserved = this._reserved.increase(quantity.value);
    this._available = this._available.decrease(quantity.value);
    this.raise(
      new InventoryReservedEvent({ inventoryId: this._id, variantId: this._variantId, quantity }),
    );
  }

  /**
   * Marks units as sold out once the owning order items are confirmed.
   * A sold-out unit is no longer available and no longer reserved.
   */
  markSoldOut(quantity: Quantity, _actorId: Id) {
    this.ensureNotDeleted();
    // Move items from reserved to sold‑out. The reservation already reduced `available`.
    this._soldOut = this._soldOut.increase(quantity.value);
    this._reserved = this._reserved.decrease(quantity.value);
    this.raise(
      new InventorySoldOutEvent({ inventoryId: this._id, variantId: this._variantId, quantity }),
    );
  }

  /** Consumes held stock once an order is fulfilled (reserved leaves the shelf). */
  complete(quantity: Quantity, _actorId: Id) {
    this.ensureNotDeleted();
    // Move items from reserved to sold‑out when the order is fulfilled.
    this._reserved = this._reserved.decrease(quantity.value);
    this._soldOut = this._soldOut.increase(quantity.value);
    this.raise(
      new InventoryCompletedEvent({ inventoryId: this._id, variantId: this._variantId, quantity }),
    );
  }

  /** Puts a held reservation back on the shelf (order cancelled before fulfilment). */
  release(quantity: Quantity, _actorId: Id) {
    this.ensureNotDeleted();
    this._reserved = this._reserved.decrease(quantity.value);
    this._available = this._available.increase(quantity.value);
    this.raise(
      new InventoryReleasedEvent({ inventoryId: this._id, variantId: this._variantId, quantity }),
    );
  }

  /** Puts already-consumed stock back on the shelf (a return). */
  restock(quantity: Quantity, _actorId: Id) {
    this.ensureNotDeleted();
    this._available = this._available.increase(quantity.value);
    this.raise(
      new InventoryRestockedEvent({ inventoryId: this._id, variantId: this._variantId, quantity }),
    );
  }

  /** Moves sold-out units back to available when items are refunded or returned. */
  unsold(quantity: Quantity, _actorId: Id) {
    this.ensureNotDeleted();
    this._soldOut = this._soldOut.decrease(quantity.value);
    this._available = this._available.increase(quantity.value);
    this.raise(
      new InventoryRestockedEvent({ inventoryId: this._id, variantId: this._variantId, quantity }),
    );
  }



  buy(quantity: Quantity, _actorId: Id) {
    this.ensureNotDeleted();
    this._available = this._available.increase(quantity.value);
    this.raise(
      new InventoryBoughtEvent({ inventoryId: this._id, variantId: this._variantId, quantity }),
    );
  }
  updateLowStockThreshold(quantity: Quantity, _actorId: Id) {
    this.ensureNotDeleted();
    this._lowStockThreshold = quantity;
    this.raise(
      new InventoryLowStockThresholdUpdatedEvent({
        inventoryId: this._id,
        variantId: this._variantId,
        quantity,
      }),
    );
  }
  removeStock(quantity: Quantity, _actorId: Id) {
    this.ensureNotDeleted();
    this._available = this._available.decrease(quantity.value);
    this.raise(
      new InventoryStockRemovedEvent({
        inventoryId: this._id,
        variantId: this._variantId,
        quantity,
      }),
    );
  }
  deleteInventory(reason: Reason, actorId: Id) {
    if (this._delete.isDeleted) {
      throw new BadRequestError('This inventory has already been deleted.');
    }
    if (!this._available.isZero)
      throw new BadRequestError('Clear the available stock before deleting this inventory.');
    if (!this._reserved.isZero)
      throw new BadRequestError('Clear the reserved stock before deleting this inventory.');
    if (!this._soldOut.isZero)
      throw new BadRequestError('Clear the sold-out stock before deleting this inventory.');
    this._delete = DeleteInfoVO.create(actorId, reason);
    this.raise(
      new InventoryDeletedEvent({
        inventoryId: this._id,
        variantId: this._variantId,
        actorId,
        deletionInfo: this._delete,
      }),
    );
  }

  private ensureNotDeleted(): void {
    if (this._delete.isDeleted) {
      throw new BadRequestError('This inventory has been deleted.');
    }
  }
}
