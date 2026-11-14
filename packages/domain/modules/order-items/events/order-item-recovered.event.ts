import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export type OrderItemRecoveredEventPayload = {
  orderItemId: Id;
  orderId: Id;
  vendorId: Id;
  actorId: Id;
};

export class OrderItemRecoveredEvent implements IEvent<OrderItemRecoveredEventPayload> {
  readonly type = 'order-item.recovered';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: OrderItemRecoveredEventPayload) {}
}
