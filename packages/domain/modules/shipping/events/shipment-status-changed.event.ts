import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

/** Movement between non-terminal states (in transit, out for delivery). */
export class ShipmentStatusChangedEvent
  implements IEvent<{ shipmentId: Id; status: string; actorId: Id }>
{
  readonly type = 'shipment.status-changed';
  readonly occurredOn = EffectiveDate.today();
  constructor(public readonly payload: { shipmentId: Id; status: string; actorId: Id }) {}
}
