import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id, type Reason } from '../../../value-objects';
import type { OrderRequestTypeVO } from '../value-objects/order-request-type.vo';

export class OrderRequestCreatedEvent
  implements
    IEvent<{
      requestId: Id;
      orderId: Id;
      orderItemId: Id | null;
      vendorId: Id;
      buyerId: Id;
      type: OrderRequestTypeVO;
      reason: Reason;
      note: string | null;
    }>
{
  readonly type = 'order-request.created';
  readonly occurredOn = EffectiveDate.today();

  constructor(
    public readonly payload: {
      requestId: Id;
      orderId: Id;
      orderItemId: Id | null;
      vendorId: Id;
      buyerId: Id;
      type: OrderRequestTypeVO;
      reason: Reason;
      note: string | null;
    },
  ) {}
}
