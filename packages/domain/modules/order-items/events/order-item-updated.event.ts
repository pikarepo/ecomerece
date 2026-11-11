import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate } from '../../../value-objects';
import type { OrderItemUpdatedEventPayload } from './order-item-event-payload';

export class OrderItemUpdatedEvent implements IEvent<OrderItemUpdatedEventPayload> {
  readonly type = 'order-item.updated';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: OrderItemUpdatedEventPayload) {}
}
