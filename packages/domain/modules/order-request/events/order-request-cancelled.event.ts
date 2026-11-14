import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class OrderRequestCancelledEvent
  implements
    IEvent<{
      requestId: Id;
      orderId: Id;
      buyerId: Id;
    }>
{
  readonly type = 'order-request.cancelled';
  readonly occurredOn = EffectiveDate.today();

  constructor(
    public readonly payload: {
      requestId: Id;
      orderId: Id;
      buyerId: Id;
    },
  ) {}
}
