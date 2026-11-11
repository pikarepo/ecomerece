import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate } from '../../../value-objects';
import type { OrderItemEventPayload } from './order-item-event-payload';

export class OrderItemCancelledEvent implements IEvent<OrderItemEventPayload> {
  readonly type = 'order-item.cancelled';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: OrderItemEventPayload) {}
}
