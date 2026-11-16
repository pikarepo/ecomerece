import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id, type Reason } from '../../../value-objects';

export class ShipmentFailedEvent
  implements IEvent<{ shipmentId: Id; reason: Reason; actorId: Id }>
{
  readonly type = 'shipment.failed';
  readonly occurredOn = EffectiveDate.today();
  constructor(public readonly payload: { shipmentId: Id; reason: Reason; actorId: Id }) {}
}
