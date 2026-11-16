import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id, Money, type Reason } from '../../../value-objects';

export class PaymentRefundedEvent
  implements IEvent<{ paymentId: Id; orderId: Id; amount: Money; reason: Reason; partial: boolean }>
{
  readonly type = 'payment.refunded';
  readonly occurredOn = EffectiveDate.today();
  constructor(
    public readonly payload: {
      paymentId: Id;
      orderId: Id;
      amount: Money;
      reason: Reason;
      partial: boolean;
    },
  ) {}
}
