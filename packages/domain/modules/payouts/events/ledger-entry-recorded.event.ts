import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id, Money } from '../../../value-objects';

export class LedgerEntryRecordedEvent
  implements
    IEvent<{
      ledgerEntryId: Id;
      vendorId: Id;
      type: string;
      amount: Money;
      referenceId: string | null;
    }>
{
  readonly type = 'payout-ledger.entry-recorded';
  readonly occurredOn = EffectiveDate.today();
  constructor(
    public readonly payload: {
      ledgerEntryId: Id;
      vendorId: Id;
      type: string;
      amount: Money;
      referenceId: string | null;
    },
  ) {}
}
