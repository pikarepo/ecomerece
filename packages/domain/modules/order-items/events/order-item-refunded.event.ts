import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate } from '../../../value-objects';
import type { OrderItemEventPayload } from './order-item-event-payload';

export class OrderItemRefundedEvent implements IEvent<OrderItemEventPayload> {
  readonly type = 'order-item.refunded';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: OrderItemEventPayload) {}
}
