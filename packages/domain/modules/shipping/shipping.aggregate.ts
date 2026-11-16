import { AggregateRoot } from '../../aggregate-root';
import { BadRequestError } from '../../errors/app-error';
import {
  DeleteInfoVO,
  EffectiveDate,
  type FullAddressVO,
  type Id,
  Money,
  Quantity,
  type Reason,
} from '../../value-objects';
import { ShipmentCancelledEvent } from './events/shipment-cancelled.event';
import { ShipmentCreatedEvent } from './events/shipment-created.event';
import { ShipmentDeletedEvent } from './events/shipment-deleted.event';
import { ShipmentDeliveredEvent } from './events/shipment-delivered.event';
import { ShipmentDispatchedEvent } from './events/shipment-dispatched.event';
import { ShipmentFailedEvent } from './events/shipment-failed.event';
import { ShipmentRecoveredEvent } from './events/shipment-recovered.event';
import { ShipmentReturnedEvent } from './events/shipment-returned.event';
import { ShipmentStatusChangedEvent } from './events/shipment-status-changed.event';
import { ShipmentTrackingAssignedEvent } from './events/shipment-tracking-assigned.event';
import type { CarrierVO } from './value-objects/carrier.vo';
import { ShipmentStatusVO } from './value-objects/shipment-status.vo';
import type { ShippingMethodVO } from './value-objects/shipping-method.vo';
import { TrackingEventVO } from './value-objects/tracking-event.vo';
import type { TrackingNumberVO } from './value-objects/tracking-number.vo';

export type CreateShipmentProps = {
  id: Id;
  orderId: Id;
  vendorId: Id;
  buyerId: Id;
  carrier: CarrierVO;
  shippingMethod: ShippingMethodVO;
  cost: Money;
  weightGrams: Quantity;
  address: FullAddressVO;
  estimatedDelivery: Date | null;
};

export type AssignTrackingProps = {
  carrier: CarrierVO;
  shippingMethod: ShippingMethodVO;
  trackingNumber: TrackingNumberVO;
  cost: Money;
  estimatedDelivery: Date | null;
};

/**
 * One parcel for one order of one vendor.
 *
 * The order aggregate keeps the commercial facts; a shipment keeps only what
 * the carrier needs (address snapshot, weight, label cost, ETA) plus its own
 * lifecycle, so a vendor can split an order across parcels without touching
 * order state.
 */
export class ShipmentAggregate extends AggregateRoot {
  constructor(
    private readonly _id: Id,
    private readonly _orderId: Id,
    private readonly _vendorId: Id,
    private readonly _buyerId: Id,
    private _carrier: CarrierVO,
    private _shippingMethod: ShippingMethodVO,
    private _trackingNumber: TrackingNumberVO | null,
    private _status: ShipmentStatusVO,
    private _cost: Money,
    private readonly _weightGrams: Quantity,
    private readonly _address: FullAddressVO,
    private _estimatedDelivery: Date | null,
    private _dispatchedAt: EffectiveDate | null,
    private _deliveredAt: EffectiveDate | null,
    private _trackingEvents: TrackingEventVO[],
    private _delete: DeleteInfoVO,
    private readonly _version: Quantity,
    private readonly _createdAt: EffectiveDate,
  ) {
    super();
  }

  get id() {
    return this._id;
  }
  get orderId() {
    return this._orderId;
  }
  get vendorId() {
    return this._vendorId;
  }
  get buyerId() {
    return this._buyerId;
  }
  get carrier() {
    return this._carrier;
  }
  get shippingMethod() {
    return this._shippingMethod;
  }
  get trackingNumber() {
    return this._trackingNumber;
  }
  get status() {
    return this._status;
  }
  get cost() {
    return this._cost;
  }
  get weightGrams() {
    return this._weightGrams;
  }
  get address() {
    return this._address;
  }
  get estimatedDelivery() {
    return this._estimatedDelivery;
  }
  get dispatchedAt() {
    return this._dispatchedAt;
  }
  get deliveredAt() {
    return this._deliveredAt;
  }
  /** Parcel scan history; distinct from the domain events buffered by AggregateRoot. */
  get trackingEvents() {
    return [...this._trackingEvents];
  }
  get delete() {
    return this._delete;
  }
  get version() {
    return this._version;
  }
  get createdAt() {
    return this._createdAt;
  }

  static create(data: CreateShipmentProps): ShipmentAggregate {
    return new ShipmentAggregate(
      data.id,
      data.orderId,
      data.vendorId,
      data.buyerId,
      data.carrier,
      data.shippingMethod,
      null,
      ShipmentStatusVO.pending(),
      data.cost,
      data.weightGrams,
      data.address,
      data.estimatedDelivery,
      null,
      null,
      [],
      DeleteInfoVO.none(),
      Quantity.none(),
      EffectiveDate.today(),
    );
  }

  static rehydrate(
    _id: Id,
    _orderId: Id,
    _vendorId: Id,
    _buyerId: Id,
    _carrier: CarrierVO,
    _shippingMethod: ShippingMethodVO,
    _trackingNumber: TrackingNumberVO | null,
    _status: ShipmentStatusVO,
    _cost: Money,
    _weightGrams: Quantity,
    _address: FullAddressVO,
    _estimatedDelivery: Date | null,
    _dispatchedAt: EffectiveDate | null,
    _deliveredAt: EffectiveDate | null,
    _events: TrackingEventVO[],
    _delete: DeleteInfoVO,
    _version: Quantity,
    _createdAt: EffectiveDate,
  ): ShipmentAggregate {
    return new ShipmentAggregate(
      _id,
      _orderId,
      _vendorId,
      _buyerId,
      _carrier,
      _shippingMethod,
      _trackingNumber,
      _status,
      _cost,
      _weightGrams,
      _address,
      _estimatedDelivery,
      _dispatchedAt,
      _deliveredAt,
      _events,
      _delete,
      _version,
      _createdAt,
    );
  }

  createShipment(actorId: Id) {
    this.raise(
      new ShipmentCreatedEvent({
        shipmentId: this._id,
        orderId: this._orderId,
        vendorId: this._vendorId,
        actorId,
      }),
    );
  }

  /**
   * Labels are routinely reprinted or corrected between packing and dispatch,
   * so the carrier, tracking number, cost and ETA stay editable until the
   * parcel reaches a final state.
   */
  assignTracking(details: AssignTrackingProps, actorId: Id) {
    this.ensureNotDeleted();
    this._status.ensureMutable();

    this._carrier = details.carrier;
    this._shippingMethod = details.shippingMethod;
    this._trackingNumber = details.trackingNumber;
    this._cost = details.cost;
    this._estimatedDelivery = details.estimatedDelivery;

    this.raise(
      new ShipmentTrackingAssignedEvent({
        shipmentId: this._id,
        trackingNumber: details.trackingNumber.value,
        actorId,
      }),
    );
  }

  /** The parcel leaves the vendor; a tracking number must exist first. */
  dispatch(actorId: Id) {
    this.ensureNotDeleted();

    if (!this._trackingNumber) {
      throw new BadRequestError('A shipment needs a tracking number before it can be dispatched.');
    }

    this._status = this._status.dispatch();
    this._dispatchedAt = EffectiveDate.today();
    this.recordScan();

    this.raise(
      new ShipmentDispatchedEvent({
        shipmentId: this._id,
        orderId: this._orderId,
        vendorId: this._vendorId,
        actorId,
      }),
    );
  }

  markInTransit(actorId: Id) {
    this.ensureNotDeleted();
    this._status = this._status.markInTransit();
    this.recordScan();
    this.raise(
      new ShipmentStatusChangedEvent({
        shipmentId: this._id,
        status: this._status.status,
        actorId,
      }),
    );
  }

  markOutForDelivery(actorId: Id) {
    this.ensureNotDeleted();
    this._status = this._status.markOutForDelivery();
    this.recordScan();
    this.raise(
      new ShipmentStatusChangedEvent({
        shipmentId: this._id,
        status: this._status.status,
        actorId,
      }),
    );
  }

  markDelivered(actorId: Id) {
    this.ensureNotDeleted();
    this._status = this._status.markDelivered();
    this._deliveredAt = EffectiveDate.today();
    this.recordScan();

    this.raise(
      new ShipmentDeliveredEvent({
        shipmentId: this._id,
        orderId: this._orderId,
        vendorId: this._vendorId,
        actorId,
      }),
    );
  }

  markFailed(reason: Reason, actorId: Id) {
    this.ensureNotDeleted();
    this._status = this._status.markFailed();
    this.recordScan(reason.value);

    this.raise(new ShipmentFailedEvent({ shipmentId: this._id, reason, actorId }));
  }

  markReturned(reason: Reason, actorId: Id) {
    this.ensureNotDeleted();
    this._status = this._status.markReturned();
    this.recordScan(reason.value);

    this.raise(new ShipmentReturnedEvent({ shipmentId: this._id, reason, actorId }));
  }

  cancel(reason: Reason, actorId: Id) {
    this.ensureNotDeleted();
    this._status = this._status.cancel();
    this.recordScan(reason.value);

    this.raise(new ShipmentCancelledEvent({ shipmentId: this._id, reason, actorId }));
  }

  deleteShipment(reason: Reason, actorId: Id) {
    if (this._delete.isDeleted) {
      throw new BadRequestError('Shipment is already deleted.');
    }
    // An in-flight parcel must be resolved (delivered, returned, cancelled or
    // failed) before it can be hidden, otherwise tracking would go dark.
    if (!this._status.isFinal && this._status.status !== 'failed') {
      throw new BadRequestError('Only a closed shipment can be deleted.');
    }

    this._delete = DeleteInfoVO.create(actorId, reason);
    this.raise(new ShipmentDeletedEvent({ shipmentId: this._id, actorId, reason }));
  }

  recoverShipment(actorId: Id) {
    if (!this._delete.isDeleted) {
      throw new BadRequestError('Shipment is not deleted.');
    }
    this._delete = DeleteInfoVO.none();
    this.raise(new ShipmentRecoveredEvent({ shipmentId: this._id, actorId }));
  }

  ensureOwnedByVendor(vendorId: Id): void {
    if (!this._vendorId.equals(vendorId)) {
      throw new BadRequestError('You do not own this shipment.');
    }
  }

  isOwnedByBuyer(buyerId: Id): boolean {
    return this._buyerId.equals(buyerId);
  }

  private recordScan(note: string | null = null): void {
    this._trackingEvents = [...this._trackingEvents, TrackingEventVO.create(this._status, note)];
  }

  private ensureNotDeleted(): void {
    if (this._delete.isDeleted) {
      throw new BadRequestError('Cannot perform operation on a deleted shipment.');
    }
  }
}
