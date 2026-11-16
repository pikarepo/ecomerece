import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id, type Reason } from '../../../value-objects';

export class PaymentCancelledEvent
  implements IEvent<{ paymentId: Id; orderId: Id; reason: Reason | null }>
{
  readonly type = 'payment.cancelled';
  readonly occurredOn = EffectiveDate.today();
  constructor(public readonly payload: { paymentId: Id; orderId: Id; reason: Reason | null }) {}
}
