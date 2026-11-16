import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class PaymentAuthorizedEvent
  implements IEvent<{ paymentId: Id; orderId: Id; providerRef: string | null }>
{
  readonly type = 'payment.authorized';
  readonly occurredOn = EffectiveDate.today();
  constructor(
    public readonly payload: { paymentId: Id; orderId: Id; providerRef: string | null },
  ) {}
}
