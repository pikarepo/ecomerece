import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class PayoutApprovedEvent implements IEvent<{ payoutId: Id; vendorId: Id; actorId: Id }> {
  readonly type = 'payout.approved';
  readonly occurredOn = EffectiveDate.today();
  constructor(public readonly payload: { payoutId: Id; vendorId: Id; actorId: Id }) {}
}
