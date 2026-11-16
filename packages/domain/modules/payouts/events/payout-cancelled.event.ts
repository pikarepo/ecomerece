import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id, type Reason } from '../../../value-objects';

export class PayoutCancelledEvent
  implements IEvent<{ payoutId: Id; vendorId: Id; reason: Reason | null }>
{
  readonly type = 'payout.cancelled';
  readonly occurredOn = EffectiveDate.today();
  constructor(public readonly payload: { payoutId: Id; vendorId: Id; reason: Reason | null }) {}
}
