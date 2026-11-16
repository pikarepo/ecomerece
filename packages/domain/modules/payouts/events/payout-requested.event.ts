import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id, Money } from '../../../value-objects';

export class PayoutRequestedEvent implements IEvent<{ payoutId: Id; vendorId: Id; amount: Money }> {
  readonly type = 'payout.requested';
  readonly occurredOn = EffectiveDate.today();
  constructor(public readonly payload: { payoutId: Id; vendorId: Id; amount: Money }) {}
}
