import { BadRequestError } from '../../../errors/app-error';
import { StringVO } from '../../../value-objects';

export const LedgerEntryTypeEnum = {
  SALE_CREDIT: 'sale_credit',
  COMMISSION_DEBIT: 'commission_debit',
  REFUND_DEBIT: 'refund_debit',
  COMMISSION_REVERSAL: 'commission_reversal',
  PAYOUT_DEBIT: 'payout_debit',
  PAYOUT_REVERSAL: 'payout_reversal',
  ADJUSTMENT: 'adjustment',
} as const;

export type LedgerEntryType = (typeof LedgerEntryTypeEnum)[keyof typeof LedgerEntryTypeEnum];

export class LedgerEntryTypeVO extends StringVO {
  private constructor(value: LedgerEntryType) {
    super(value);
  }
  static create(value: string) {
    if (!Object.values(LedgerEntryTypeEnum).includes(value as LedgerEntryType))
      throw new BadRequestError(`Invalid ledger entry type: "${value}"`);
    return new LedgerEntryTypeVO(value as LedgerEntryType);
  }
  static rehydrate(v: LedgerEntryType) {
    return new LedgerEntryTypeVO(v);
  }
}
