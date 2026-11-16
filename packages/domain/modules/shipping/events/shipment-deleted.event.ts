import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id, type Reason } from '../../../value-objects';

export class ShipmentDeletedEvent
  implements IEvent<{ shipmentId: Id; actorId: Id; reason: Reason }>
{
  readonly type = 'shipment.deleted';
  readonly occurredOn = EffectiveDate.today();
  constructor(public readonly payload: { shipmentId: Id; actorId: Id; reason: Reason }) {}
}
