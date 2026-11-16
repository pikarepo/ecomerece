import type {
  Id,
  LedgerEntryReadModel,
  PayoutReadModel,
  VendorBalanceReadModel,
} from '@ecomerece/domain';

export interface IPayoutQueries {
  getVendorBalance(vendorId: Id): Promise<VendorBalanceReadModel>;
  getPayoutById(payoutId: Id): Promise<PayoutReadModel | null>;
  getLedgerByVendor(
    vendorId: Id,
    params: { cursor?: string; limit?: number; direction?: 'next' | 'prev' },
  ): Promise<{
    data: LedgerEntryReadModel[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }>;
}
