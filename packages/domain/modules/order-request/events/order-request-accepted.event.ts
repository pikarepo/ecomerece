import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id, type Reason } from '../../../value-objects';
import type { OrderRequestTypeVO } from '../value-objects/order-request-type.vo';

export class OrderRequestAcceptedEvent
  implements
    IEvent<{
      requestId: Id;
      orderId: Id;
      orderItemId: Id | null;
      vendorId: Id;
      actorId: Id;
      type: OrderRequestTypeVO;
      reason: Reason;
      vendorResponseNote: string | null;
    }>
{
  readonly type = 'order-request.accepted';
  readonly occurredOn = EffectiveDate.today();

  constructor(
    public readonly payload: {
      requestId: Id;
      orderId: Id;
      orderItemId: Id | null;
      vendorId: Id;
      actorId: Id;
      type: OrderRequestTypeVO;
      reason: Reason;
      vendorResponseNote: string | null;
    },
  ) {}
}
