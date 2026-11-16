import { AggregateRoot } from '../../aggregate-root';
import { BadRequestError } from '../../errors/app-error';
import { EffectiveDate, type Id, Money, Quantity, type Reason } from '../../value-objects';
import { PayoutApprovedEvent } from './events/payout-approved.event';
import { PayoutCancelledEvent } from './events/payout-cancelled.event';
import { PayoutFailedEvent } from './events/payout-failed.event';
import { PayoutPaidEvent } from './events/payout-paid.event';
import { PayoutRequestedEvent } from './events/payout-requested.event';
import { PayoutStatusVO } from './value-objects/payout-status.vo';

export interface CreatePayoutProps {
  id: Id;
  vendorId: Id;
  amount: Money;
  currency: string;
  method: string;
  destinationRef: string | null;
}

export class PayoutAggregate extends AggregateRoot {
  constructor(
    private readonly _id: Id,
    private readonly _vendorId: Id,
    private readonly _amount: Money,
    private readonly _currency: string,
    private _status: PayoutStatusVO,
    private readonly _method: string,
    private readonly _destinationRef: string | null,
    private _providerRef: string | null,
    private _failureReason: Reason | null,
    private readonly _version: Quantity,
    private readonly _createdAt: EffectiveDate,
  ) {
    super();
    if (_amount.value <= 0) throw new BadRequestError('Payout amount must be greater than zero.');
  }

  get id() {
    return this._id;
  }
  get vendorId() {
    return this._vendorId;
  }
  get amount() {
    return this._amount;
  }
  get currency() {
    return this._currency;
  }
  get status() {
    return this._status;
  }
  get method() {
    return this._method;
  }
  get destinationRef() {
    return this._destinationRef;
  }
  get providerRef() {
    return this._providerRef;
  }
  get failureReason() {
    return this._failureReason;
  }
  get version() {
    return this._version;
  }
  get createdAt() {
    return this._createdAt;
  }

  static create(data: CreatePayoutProps): PayoutAggregate {
    const method = (data.method || 'manual').trim().toLowerCase();
    return new PayoutAggregate(
      data.id,
      data.vendorId,
      data.amount,
      (data.currency || 'USD').toUpperCase(),
      PayoutStatusVO.requested(),
      method,
      data.destinationRef,
      null,
      null,
      Quantity.none(),
      EffectiveDate.today(),
    );
  }

  static rehydrate(
    id: Id,
    vendorId: Id,
    amount: Money,
    currency: string,
    status: PayoutStatusVO,
    method: string,
    destinationRef: string | null,
    providerRef: string | null,
    failureReason: Reason | null,
    version: Quantity,
    createdAt: EffectiveDate,
  ) {
    return new PayoutAggregate(
      id,
      vendorId,
      amount,
      currency,
      status,
      method,
      destinationRef,
      providerRef,
      failureReason,
      version,
      createdAt,
    );
  }

  request() {
    this.raise(
      new PayoutRequestedEvent({
        payoutId: this._id,
        vendorId: this._vendorId,
        amount: this._amount,
      }),
    );
  }
  approve(actorId: Id) {
    this._status = this._status.approve();
    this.raise(new PayoutApprovedEvent({ payoutId: this._id, vendorId: this._vendorId, actorId }));
  }
  markProcessing() {
    this._status = this._status.process();
  }
  markPaid(providerRef: string | null) {
    this._status = this._status.markPaid();
    this._providerRef = providerRef;
    this.raise(new PayoutPaidEvent({ payoutId: this._id, vendorId: this._vendorId, providerRef }));
  }
  markFailed(reason: Reason) {
    this._status = this._status.fail();
    this._failureReason = reason;
    this.raise(new PayoutFailedEvent({ payoutId: this._id, vendorId: this._vendorId, reason }));
  }
  cancel(reason: Reason | null) {
    this._status = this._status.cancel();
    this._failureReason = reason;
    this.raise(new PayoutCancelledEvent({ payoutId: this._id, vendorId: this._vendorId, reason }));
  }
}
