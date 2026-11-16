import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id, Money } from '../../../value-objects';

export class PaymentCapturedEvent
  implements IEvent<{ paymentId: Id; orderId: Id; amount: Money; providerRef: string | null }>
{
  readonly type = 'payment.captured';
  readonly occurredOn = EffectiveDate.today();
  constructor(
    public readonly payload: {
      paymentId: Id;
      orderId: Id;
      amount: Money;
      providerRef: string | null;
    },
  ) {}
}
