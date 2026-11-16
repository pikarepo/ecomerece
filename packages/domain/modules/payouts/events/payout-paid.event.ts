import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class PayoutPaidEvent
  implements IEvent<{ payoutId: Id; vendorId: Id; providerRef: string | null }>
{
  readonly type = 'payout.paid';
  readonly occurredOn = EffectiveDate.today();
  constructor(
    public readonly payload: { payoutId: Id; vendorId: Id; providerRef: string | null },
  ) {}
}
