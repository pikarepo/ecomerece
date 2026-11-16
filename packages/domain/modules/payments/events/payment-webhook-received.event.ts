import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class PaymentWebhookReceivedEvent
  implements
    IEvent<{ paymentId: Id | null; provider: string; providerRef: string | null; event: string }>
{
  readonly type = 'payment.webhook-received';
  readonly occurredOn = EffectiveDate.today();
  constructor(
    public readonly payload: {
      paymentId: Id | null;
      provider: string;
      providerRef: string | null;
      event: string;
    },
  ) {}
}
