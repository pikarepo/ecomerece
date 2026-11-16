import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id, type Reason } from '../../../value-objects';

export class PayoutFailedEvent implements IEvent<{ payoutId: Id; vendorId: Id; reason: Reason }> {
  readonly type = 'payout.failed';
  readonly occurredOn = EffectiveDate.today();
  constructor(public readonly payload: { payoutId: Id; vendorId: Id; reason: Reason }) {}
}
