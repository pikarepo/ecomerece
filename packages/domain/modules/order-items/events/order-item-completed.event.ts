import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate } from '../../../value-objects';
import type { OrderItemEventPayload } from './order-item-event-payload';

export class OrderItemCompletedEvent implements IEvent<OrderItemEventPayload> {
  readonly type = 'order-item.completed';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: OrderItemEventPayload) {}
}
