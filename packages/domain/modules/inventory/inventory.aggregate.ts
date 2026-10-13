import { BadRequestError } from '../../../../apps/api/errors/app-error';
import { AggregateRoot } from '../../aggregate-root';
import { DeleteInfoVO, EffectiveDate, type Id, Quantity, type Reason } from '../../value-objects';
import { InventoryBoughtEvent } from './events/inventory-bought.event';
import { InventoryCompletedEvent } from './events/inventory-completed.event';
import { InventoryCreatedEvent } from './events/inventory-created.event';
import { InventoryDeletedEvent } from './events/inventory-deleted.event';
import { InventoryLowStockThresholdUpdatedEvent } from './events/inventory-low-stock-threshold-updated.event';
import { InventoryReservedEvent } from './events/inventory-reserved.event';
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

      _lowStockThreshold,
      _delete,
      _version,
      _createdAt,
    );
  }

  reserve(quantity: Quantity, actorId: Id) {
    this._reserved = this._reserved.increase(quantity.value);
    this._available = this._available.decrease(quantity.value);
    this.raise(
      new InventoryReservedEvent({ inventoryId: this._id, variantId: this._variantId, quantity }),
    );
  }

  complete(quantity: Quantity, actorId: Id) {
    this._reserved = this._reserved.decrease(quantity.value);
    this.raise(
      new InventoryCompletedEvent({ inventoryId: this._id, variantId: this._variantId, quantity }),
    );
  }

  buy(quantity: Quantity, actorId: Id) {
    this._available = this._available.increase(quantity.value);
    this.raise(
      new InventoryBoughtEvent({ inventoryId: this._id, variantId: this._variantId, quantity }),
    );
  }
  updateLowStockThreshold(quantity: Quantity, actorId: Id) {
    this._lowStockThreshold = quantity;
    this.raise(
      new InventoryLowStockThresholdUpdatedEvent({
        inventoryId: this._id,
        variantId: this._variantId,
        quantity,
      }),
    );
  }
  removeStock(quantity: Quantity, actorId: Id) {
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
    if (!this._available.isZero)
      throw new BadRequestError('Clear the available stock before deleting this inventory.');
    if (!this._reserved.isZero)
      throw new BadRequestError('Clear the reserved stock before deleting this inventory.');
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
}
