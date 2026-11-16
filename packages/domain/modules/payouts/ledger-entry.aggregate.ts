import { AggregateRoot } from '../../aggregate-root';
import { BadRequestError } from '../../errors/app-error';
import { EffectiveDate, type Id, Money, Quantity } from '../../value-objects';
import { LedgerEntryRecordedEvent } from './events/ledger-entry-recorded.event';
import type { LedgerEntryTypeVO } from './value-objects/ledger-entry-type.vo';

export interface CreateLedgerEntryProps {
  id: Id;
  vendorId: Id;
  type: LedgerEntryTypeVO;
  /** Positive = credit to vendor balance, negative = debit. */
  amount: number;
  currency: string;
  referenceType: string | null;
  referenceId: string | null;
  note: string | null;
}

export class LedgerEntryAggregate extends AggregateRoot {
  constructor(
    private readonly _id: Id,
    private readonly _vendorId: Id,
    private readonly _type: LedgerEntryTypeVO,
    private readonly _amount: number,
    private readonly _currency: string,
    private readonly _referenceType: string | null,
    private readonly _referenceId: string | null,
    private readonly _note: string | null,
    private readonly _version: Quantity,
    private readonly _createdAt: EffectiveDate,
  ) {
    super();
  }

  get id() {
    return this._id;
  }
  get vendorId() {
    return this._vendorId;
  }
  get type() {
    return this._type;
  }
  get amount() {
    return this._amount;
  }
  get currency() {
    return this._currency;
  }
  get referenceType() {
    return this._referenceType;
  }
  get referenceId() {
    return this._referenceId;
  }
  get note() {
    return this._note;
  }
  get version() {
    return this._version;
  }
  get createdAt() {
    return this._createdAt;
  }

  static create(data: CreateLedgerEntryProps): LedgerEntryAggregate {
    if (!Number.isFinite(data.amount) || data.amount === 0)
      throw new BadRequestError('Ledger entry amount cannot be zero.');
    return new LedgerEntryAggregate(
      data.id,
      data.vendorId,
      data.type,
      data.amount,
      (data.currency || 'USD').toUpperCase(),
      data.referenceType,
      data.referenceId,
      data.note,
      Quantity.none(),
      EffectiveDate.today(),
    );
  }

  static rehydrate(
    id: Id,
    vendorId: Id,
    type: LedgerEntryTypeVO,
    amount: number,
    currency: string,
    referenceType: string | null,
    referenceId: string | null,
    note: string | null,
    version: Quantity,
    createdAt: EffectiveDate,
  ) {
    return new LedgerEntryAggregate(
      id,
      vendorId,
      type,
      amount,
      currency,
      referenceType,
      referenceId,
      note,
      version,
      createdAt,
    );
  }

  record() {
    this.raise(
      new LedgerEntryRecordedEvent({
        ledgerEntryId: this._id,
        vendorId: this._vendorId,
        type: this._type.value,
        amount: Money.rehydrate(Math.abs(this._amount)),
        referenceId: this._referenceId,
      }),
    );
  }
}
