import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class ShipmentRecoveredEvent implements IEvent<{ shipmentId: Id; actorId: Id }> {
  readonly type = 'shipment.recovered';
  readonly occurredOn = EffectiveDate.today();
  constructor(public readonly payload: { shipmentId: Id; actorId: Id }) {}
}
