import type { Id, Quantity } from '../../../value-objects';
import type { LedgerEntryAggregate } from '../ledger-entry.aggregate';
import type { PayoutAggregate } from '../payout.aggregate';

export interface PayoutPage {
  data: PayoutAggregate[];
  meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
}
export interface LedgerPage {
  data: LedgerEntryAggregate[];
  meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
}

export interface IPayoutRepository {
  FindById(id: Id): Promise<PayoutAggregate | null>;
  FindByIdOrThrow(id: Id): Promise<PayoutAggregate>;
  FindPaginated(params: {
    filter?: { vendorId?: string; status?: string };
    cursor?: Id;
    limit?: Quantity;
    direction?: 'next' | 'prev';
  }): Promise<PayoutPage>;
  Create(payout: PayoutAggregate): Promise<void>;
  Save(payout: PayoutAggregate): Promise<void>;
}

export interface ILedgerRepository {
  Create(entry: LedgerEntryAggregate): Promise<void>;
  FindByVendor(
    vendorId: Id,
    params: { cursor?: Id; limit?: Quantity; direction?: 'next' | 'prev' },
  ): Promise<LedgerPage>;
  SumByVendor(vendorId: Id): Promise<number>;
  ExistsByReference(referenceType: string, referenceId: string, type: string): Promise<boolean>;
}
