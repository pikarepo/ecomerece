import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class PaymentIntentCreatedEvent
  implements IEvent<{ paymentId: Id; orderId: Id; buyerId: Id; provider: string }>
{
  readonly type = 'payment.created';
  readonly occurredOn = EffectiveDate.today();
  constructor(
    public readonly payload: { paymentId: Id; orderId: Id; buyerId: Id; provider: string },
  ) {}
}
