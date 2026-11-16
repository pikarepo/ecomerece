import { describe, expect, it } from 'bun:test';
import { ShipmentAggregate } from '@ecomerece/domain';
import { CarrierVO } from '@ecomerece/domain/modules/shipping/value-objects/carrier.vo';
import { ShippingMethodVO } from '@ecomerece/domain/modules/shipping/value-objects/shipping-method.vo';
import { TrackingNumberVO } from '@ecomerece/domain/modules/shipping/value-objects/tracking-number.vo';
import type { IEvent } from '@ecomerece/domain/events/event-bus.interface';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { Money } from '@ecomerece/domain/value-objects/money.vo';
import { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import { Reason } from '@ecomerece/domain/value-objects/reason.vo';
import { FullAddressVO } from '@ecomerece/domain/value-objects/street-address.vo';
import type { ShipmentRepository } from '../../infrastructure/shipment.repository';
import { ShippingApplicationService } from '../shipping.app.service';

const id = (n: number) => Id.create(`00000000-0000-7000-8000-${String(n).padStart(12, '0')}`);
const orderId = id(1);
const reason = Reason.create('buyer cancelled the order before dispatch');

function shipment(order = orderId) {
  return ShipmentAggregate.create({
    id: id(700),
    orderId: order,
    vendorId: id(2),
    buyerId: id(3),
    carrier: CarrierVO.create('tcs'),
    shippingMethod: ShippingMethodVO.create('standard'),
    cost: Money.create(250),
    weightGrams: Quantity.create(1200),
    address: FullAddressVO.create('12 Mall Road, Lahore, Punjab, Pakistan'),
    estimatedDelivery: null,
  });
}

function dispatched(order = orderId) {
  const aggregate = shipment(order);
  aggregate.assignTracking(
    {
      carrier: CarrierVO.create('tcs'),
      shippingMethod: ShippingMethodVO.create('standard'),
      trackingNumber: TrackingNumberVO.create('TCS-123456789'),
      cost: Money.create(250),
      estimatedDelivery: null,
    },
    id(9),
  );
  aggregate.dispatch(id(9));
  aggregate.clearEvents();
  return aggregate;
}

function buildService(shipments: ShipmentAggregate[]) {
  const saved: ShipmentAggregate[] = [];
  const published: IEvent[] = [];

  const repository = {
    FindByOrderId: async (order: Id) =>
      shipments.filter((shipment) => shipment.orderId.value === order.value),
    Save: async (shipment: ShipmentAggregate) => {
      saved.push(shipment);
    },
  };

  const eventBus = {
    register: () => undefined,
    publish: async (events: IEvent | IEvent[]) => {
      published.push(...(Array.isArray(events) ? events : [events]));
    },
  };

  const service = new ShippingApplicationService(
    repository as unknown as ShipmentRepository,
    {} as never,
    eventBus,
  );

  return { service, saved, published };
}

describe('order.cancelled reaction', () => {
  it('cancels every parcel that has not moved yet', async () => {
    const pending = shipment();
    const inFlight = dispatched();
    const { service, saved, published } = buildService([pending, inFlight]);

    const cancelled = await service.cancelShipmentsForOrder(orderId, reason, id(9));

    expect(cancelled).toBe(2);
    expect(pending.status.value).toBe('cancelled');
    expect(inFlight.status.value).toBe('cancelled');
    expect(saved).toHaveLength(2);
    expect(published.map((event) => event.type)).toEqual([
      'shipment.cancelled',
      'shipment.cancelled',
    ]);
  });

  it('leaves parcels whose goods already moved untouched', async () => {
    const delivered = dispatched();
    delivered.markDelivered(id(9));
    delivered.clearEvents();
    const physicalReturn = dispatched();
    physicalReturn.markReturned(reason, id(9));
    physicalReturn.clearEvents();

    const { service, saved, published } = buildService([delivered, physicalReturn]);

    const cancelled = await service.cancelShipmentsForOrder(orderId, reason, id(9));

    expect(cancelled).toBe(0);
    expect(delivered.status.value).toBe('delivered');
    expect(physicalReturn.status.value).toBe('returned');
    expect(saved).toHaveLength(0);
    expect(published).toHaveLength(0);
  });

  it('ignores shipments of other orders and is idempotent', async () => {
    const pending = shipment();
    const otherOrder = shipment(id(4));
    const { service, saved } = buildService([pending, otherOrder]);

    await service.cancelShipmentsForOrder(orderId, reason, id(9));
    const secondRun = await service.cancelShipmentsForOrder(orderId, reason, id(9));

    expect(pending.status.value).toBe('cancelled');
    expect(otherOrder.status.value).toBe('pending');
    expect(secondRun).toBe(0);
    expect(saved).toHaveLength(1);
  });
});
