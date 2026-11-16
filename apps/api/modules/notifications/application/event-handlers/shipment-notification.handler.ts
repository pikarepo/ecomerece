import type { IShipmentQueries } from '@ecomerece/contracts';
import type { IEvent, IEventHandler } from '@ecomerece/domain/events/event-bus.interface';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { NotificationsApplicationService } from '../notifications.app.service';

type ShipmentEventPayload = { shipmentId: Id; reason?: { value: string } };

/** Registered for shipped, delivered and failed parcel events. */
export class ShipmentNotificationHandler implements IEventHandler<ShipmentEventPayload> {
  constructor(
    private readonly notifications: NotificationsApplicationService,
    private readonly shipmentQueries: IShipmentQueries,
  ) {}

  async handle(event: IEvent<ShipmentEventPayload>): Promise<void> {
    const { shipment } = await this.shipmentQueries.ensureActiveById(event.payload.shipmentId);
    if (!shipment) return;

    await this.notifications.createNotification({
      userId: Id.create(shipment.buyerId),
      type: 'shipment',
      title: this.titleFor(event.type),
      body: this.bodyFor(event, shipment.trackingNumber, shipment.carrier),
      referenceId: Id.create(shipment.id),
    });
  }

  private titleFor(eventType: string): string {
    if (eventType === 'shipment.delivered') return 'Shipment delivered';
    if (eventType === 'shipment.failed') return 'Delivery attempt failed';
    return 'Shipment dispatched';
  }

  private bodyFor(event: IEvent<ShipmentEventPayload>, tracking: string | null, carrier: string) {
    const where = tracking ? `${carrier} tracking ${tracking}` : 'your parcel';

    if (event.type === 'shipment.delivered') {
      return `${where} was delivered. Please confirm everything arrived as expected.`;
    }
    if (event.type === 'shipment.failed') {
      const reason = event.payload.reason?.value ?? 'the carrier could not complete delivery';
      return `Delivery failed: ${reason}. The vendor will arrange another attempt or a return.`;
    }
    return `Your parcel is on its way with ${where}.`;
  }
}
