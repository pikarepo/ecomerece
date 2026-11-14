import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id, type Reason } from '../../../value-objects';

export class OrderRequestRejectedEvent
  implements
    IEvent<{
      requestId: Id;
      orderId: Id;
      orderItemId: Id | null;
      vendorId: Id;
      actorId: Id;
      rejectionReason: Reason;
    }>
{
  readonly type = 'order-request.rejected';
  readonly occurredOn = EffectiveDate.today();

  constructor(
    public readonly payload: {
      requestId: Id;
      orderId: Id;
      orderItemId: Id | null;
      vendorId: Id;
      actorId: Id;
      rejectionReason: Reason;
    },
  ) {}
}
