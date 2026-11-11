import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class OrderUpdatedEvent implements IEvent<{ orderId: Id; actorId: Id }> {
  readonly type = 'order.updated';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { orderId: Id; actorId: Id }) {}
}
