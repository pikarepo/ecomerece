import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id, type Reason } from '../../../value-objects';

export class PaymentFailedEvent implements IEvent<{ paymentId: Id; orderId: Id; reason: Reason }> {
  readonly type = 'payment.failed';
  readonly occurredOn = EffectiveDate.today();
  constructor(public readonly payload: { paymentId: Id; orderId: Id; reason: Reason }) {}
}
