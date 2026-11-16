import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id, type Reason } from '../../../value-objects';

export class ShipmentCancelledEvent
  implements IEvent<{ shipmentId: Id; reason: Reason; actorId: Id }>
{
  readonly type = 'shipment.cancelled';
  readonly occurredOn = EffectiveDate.today();
  constructor(public readonly payload: { shipmentId: Id; reason: Reason; actorId: Id }) {}
}
