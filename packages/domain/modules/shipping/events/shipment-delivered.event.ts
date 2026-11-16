import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class ShipmentDeliveredEvent
  implements IEvent<{ shipmentId: Id; orderId: Id; vendorId: Id; actorId: Id }>
{
  readonly type = 'shipment.delivered';
  readonly occurredOn = EffectiveDate.today();
  constructor(
    public readonly payload: { shipmentId: Id; orderId: Id; vendorId: Id; actorId: Id },
  ) {}
}
