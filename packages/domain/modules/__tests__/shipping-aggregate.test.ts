import { describe, expect, it } from 'bun:test';
import { BadRequestError } from '../../errors/app-error';
import { EffectiveDate, Id, Money, Quantity, Reason } from '../../value-objects';
import { FullAddressVO } from '../../value-objects/street-address.vo';
import { ShipmentAggregate } from '../shipping/shipping.aggregate';
import { CarrierVO } from '../shipping/value-objects/carrier.vo';
import { ShippingMethodVO } from '../shipping/value-objects/shipping-method.vo';
import { TrackingNumberVO } from '../shipping/value-objects/tracking-number.vo';

const id = (n: number) => Id.create(`00000000-0000-7000-8000-${String(n).padStart(12, '0')}`);
const reason = () => Reason.create('recipient refused the parcel at the door');
const actor = id(9);

function shipment() {
  return ShipmentAggregate.create({
    id: id(700),
    orderId: id(1),
    vendorId: id(2),
    buyerId: id(3),
    carrier: CarrierVO.create('tcs'),
    shippingMethod: ShippingMethodVO.create('standard'),
    cost: Money.create(250),
    weightGrams: Quantity.create(1200),
    address: FullAddressVO.create('12 Mall Road, Lahore, Punjab, Pakistan'),
    estimatedDelivery: new Date('2026-12-01T00:00:00.000Z'),
  });
}

function label(trackingNumber = 'tcs-123456789') {
  return {
    carrier: CarrierVO.create('tcs'),
    shippingMethod: ShippingMethodVO.create('standard'),
    trackingNumber: TrackingNumberVO.create(trackingNumber),
    cost: Money.create(250),
    estimatedDelivery: null,
  };
}

function withLabel() {
  const aggregate = shipment();
  aggregate.assignTracking(label(), actor);
  return aggregate;
}

function dispatched() {
  const aggregate = shipment();
  aggregate.assignTracking(label(), actor);
  aggregate.dispatch(actor);
  aggregate.clearEvents();
  return aggregate;
}

describe('ShipmentAggregate creation', () => {
  it('starts pending and without a label', () => {
    const aggregate = shipment();

    expect(aggregate.status.value).toBe('pending');
    expect(aggregate.trackingNumber).toBeNull();
    expect(aggregate.dispatchedAt).toBeNull();
    expect(aggregate.deliveredAt).toBeNull();
    expect(aggregate.trackingEvents).toEqual([]);
    expect(aggregate.delete.isDeleted).toBe(false);
    expect(aggregate.pullEvents()).toEqual([]);
  });

  it('raises shipment.created when the app service registers the parcel', () => {
    const aggregate = shipment();

    aggregate.createShipment(actor);

    const [event] = aggregate.pullEvents();
    expect(event?.type).toBe('shipment.created');
    expect(event?.payload).toMatchObject({ shipmentId: id(700), orderId: id(1) });
  });
});

describe('ShipmentAggregate labels', () => {
  it('uppercases the tracking number and records the assignment', () => {
    const aggregate = withLabel();

    expect(aggregate.trackingNumber?.value).toBe('TCS-123456789');
    expect(aggregate.pullEvents().at(-1)?.type).toBe('shipment.tracking-assigned');
  });

  it('refuses tracking numbers carriers cannot print', () => {
    expect(() => withLabel().assignTracking(label('short'), actor)).toThrow(BadRequestError);
    expect(() => withLabel().assignTracking(label('HAS SPACES 123'), actor)).toThrow(
      BadRequestError,
    );
  });

  it('allows correcting the label before dispatch', () => {
    const aggregate = withLabel();

    aggregate.assignTracking(label('LEO-99887766'), actor);

    expect(aggregate.trackingNumber?.value).toBe('LEO-99887766');
  });

  it('refuses label edits once the parcel is closed', () => {
    const aggregate = dispatched();
    aggregate.markDelivered(actor);

    expect(() => aggregate.assignTracking(label(), actor)).toThrow(BadRequestError);
  });
});

describe('ShipmentAggregate lifecycle', () => {
  it('requires a label before dispatch', () => {
    expect(() => shipment().dispatch(actor)).toThrow(
      'A shipment needs a tracking number before it can be dispatched.',
    );
  });

  it('moves dispatched → in transit → out for delivery → delivered with a scan trail', () => {
    const aggregate = dispatched();

    expect(aggregate.status.value).toBe('dispatched');
    expect(aggregate.dispatchedAt).toBeInstanceOf(EffectiveDate);

    aggregate.markInTransit(actor);
    expect(aggregate.status.value).toBe('in_transit');
    expect(aggregate.pullEvents().at(-1)?.type).toBe('shipment.status-changed');

    aggregate.markOutForDelivery(actor);
    expect(aggregate.status.value).toBe('out_for_delivery');

    aggregate.markDelivered(actor);
    expect(aggregate.status.value).toBe('delivered');
    expect(aggregate.status.isFinal).toBe(true);
    expect(aggregate.deliveredAt).toBeInstanceOf(EffectiveDate);
    expect(aggregate.pullEvents().at(-1)?.type).toBe('shipment.delivered');

    expect(aggregate.trackingEvents.map((event) => event.status.value)).toEqual([
      'dispatched',
      'in_transit',
      'out_for_delivery',
      'delivered',
    ]);
  });

  it('refuses to skip states', () => {
    const aggregate = withLabel();

    expect(() => aggregate.markInTransit(actor)).toThrow(BadRequestError);
    expect(() => aggregate.markDelivered(actor)).toThrow(BadRequestError);
    expect(() => aggregate.markOutForDelivery(actor)).toThrow(BadRequestError);
  });

  it('refuses to dispatch twice', () => {
    expect(() => dispatched().dispatch(actor)).toThrow(BadRequestError);
  });

  it('records the reason as the scan note on failure', () => {
    const aggregate = dispatched();

    aggregate.markFailed(reason(), actor);

    expect(aggregate.status.value).toBe('failed');
    expect(aggregate.pullEvents().at(-1)?.type).toBe('shipment.failed');
    expect(aggregate.trackingEvents.at(-1)?.note).toBe(reason().value);
  });

  it('allows a failed parcel to be returned', () => {
    const aggregate = dispatched();
    aggregate.markFailed(reason(), actor);

    aggregate.markReturned(reason(), actor);

    expect(aggregate.status.value).toBe('returned');
    expect(aggregate.pullEvents().at(-1)?.type).toBe('shipment.returned');
  });

  it('refuses to return a pending parcel that never shipped', () => {
    expect(() => shipment().markReturned(reason(), actor)).toThrow(BadRequestError);
  });

  it('cancels while pending or dispatched only', () => {
    const pending = shipment();
    pending.cancel(reason(), actor);
    expect(pending.status.value).toBe('cancelled');
    expect(pending.pullEvents().at(-1)?.type).toBe('shipment.cancelled');

    const inTransit = dispatched();
    inTransit.markInTransit(actor);
    expect(() => inTransit.cancel(reason(), actor)).toThrow(BadRequestError);
  });

  it('refuses any change after delivery', () => {
    const aggregate = dispatched();
    aggregate.markDelivered(actor);

    expect(() => aggregate.markInTransit(actor)).toThrow(BadRequestError);
    expect(() => aggregate.markDelivered(actor)).toThrow(BadRequestError);
    expect(() => aggregate.cancel(reason(), actor)).toThrow(BadRequestError);
  });
});

describe('ShipmentAggregate deletion', () => {
  it('refuses to delete a parcel that is still moving', () => {
    expect(() => dispatched().deleteShipment(reason(), actor)).toThrow(
      'Only a closed shipment can be deleted.',
    );
  });

  it('deletes a delivered parcel and can recover it', () => {
    const aggregate = dispatched();
    aggregate.markDelivered(actor);
    aggregate.clearEvents();

    aggregate.deleteShipment(reason(), actor);
    expect(aggregate.delete.isDeleted).toBe(true);
    expect(aggregate.pullEvents().at(-1)?.type).toBe('shipment.deleted');

    aggregate.clearEvents();
    aggregate.recoverShipment(actor);
    expect(aggregate.delete.isDeleted).toBe(false);
    expect(aggregate.pullEvents().at(-1)?.type).toBe('shipment.recovered');
  });

  it('refuses a second delete and a redundant recover', () => {
    const aggregate = dispatched();
    aggregate.markDelivered(actor);
    aggregate.deleteShipment(reason(), actor);

    expect(() => aggregate.deleteShipment(reason(), actor)).toThrow(BadRequestError);
    expect(() => shipment().recoverShipment(actor)).toThrow(BadRequestError);
  });

  it('blocks commands once deleted', () => {
    const aggregate = dispatched();
    aggregate.markDelivered(actor);
    aggregate.deleteShipment(reason(), actor);

    expect(() => aggregate.markDelivered(actor)).toThrow(BadRequestError);
    expect(() => aggregate.cancel(reason(), actor)).toThrow(BadRequestError);
  });
});

describe('ShipmentAggregate ownership', () => {
  it('lets the owning vendor act and refuses everyone else', () => {
    const aggregate = shipment();

    expect(() => aggregate.ensureOwnedByVendor(id(2))).not.toThrow();
    expect(() => aggregate.ensureOwnedByVendor(id(4))).toThrow(BadRequestError);
  });

  it('recognises the buyer of the order', () => {
    const aggregate = shipment();

    expect(aggregate.isOwnedByBuyer(id(3))).toBe(true);
    expect(aggregate.isOwnedByBuyer(id(5))).toBe(false);
  });
});
