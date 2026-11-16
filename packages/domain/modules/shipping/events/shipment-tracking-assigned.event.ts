import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class ShipmentTrackingAssignedEvent
  implements IEvent<{ shipmentId: Id; trackingNumber: string; actorId: Id }>
{
  readonly type = 'shipment.tracking-assigned';
  readonly occurredOn = EffectiveDate.today();
  constructor(public readonly payload: { shipmentId: Id; trackingNumber: string; actorId: Id }) {}
}
