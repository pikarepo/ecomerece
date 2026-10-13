import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id, type Reason } from '../../../value-objects';

export class OrderRefundedEvent implements IEvent<{ orderId: Id; actorId: Id; reason: Reason }> {
  readonly type = 'order.refunded';
  readonly occurredOn = EffectiveDate.today();
  constructor(
    public readonly payload: {
      orderId: Id;
      actorId: Id;
      reason: Reason;
    },
  ) {}
}
