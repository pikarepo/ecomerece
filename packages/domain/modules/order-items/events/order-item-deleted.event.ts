import type { IEvent } from '../../../events/event-bus.interface';
import { type DeleteInfoVO, EffectiveDate, type Id } from '../../../value-objects';

export type OrderItemDeletedEventPayload = {
  orderItemId: Id;
  orderId: Id;
  vendorId: Id;
  actorId: Id;
  deletionInfo: DeleteInfoVO;
};

export class OrderItemDeletedEvent implements IEvent<OrderItemDeletedEventPayload> {
  readonly type = 'order-item.deleted';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: OrderItemDeletedEventPayload) {}
}
