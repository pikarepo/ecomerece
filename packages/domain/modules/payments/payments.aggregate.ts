import { AggregateRoot } from '../../aggregate-root';
import { BadRequestError } from '../../errors/app-error';
import {
  DeleteInfoVO,
  EffectiveDate,
  type Id,
  Money,
  Quantity,
  type Reason,
} from '../../value-objects';
import { PaymentAuthorizedEvent } from './events/payment-authorized.event';
import { PaymentCancelledEvent } from './events/payment-cancelled.event';
import { PaymentCapturedEvent } from './events/payment-captured.event';
import { PaymentFailedEvent } from './events/payment-failed.event';
import { PaymentIntentCreatedEvent } from './events/payment-intent-created.event';
import { PaymentRefundedEvent } from './events/payment-refunded.event';
import { PaymentProviderVO } from './value-objects/payment-provider.vo';
import { PaymentStatusVO } from './value-objects/payment-status.vo';
import { PaymentTransactionTypeVO } from './value-objects/transaction-type.vo';

export interface PaymentTransactionRecord {
  type: PaymentTransactionTypeVO;
  amount: Money;
  providerRef: string | null;
  reason: Reason | null;
  occurredAt: EffectiveDate;
}

export interface CreatePaymentProps {
  id: Id;
  orderId: Id;
  buyerId: Id;
  provider: PaymentProviderVO;
  amount: Money;
  currency: string;
}

export class PaymentAggregate extends AggregateRoot {
  constructor(
    private readonly _id: Id,
    private readonly _orderId: Id,
    private readonly _buyerId: Id,
    private readonly _provider: PaymentProviderVO,
    private _amount: Money,
    private _capturedAmount: Money,
    private _refundedAmount: Money,
    private _status: PaymentStatusVO,
    private readonly _currency: string,
    private _providerRef: string | null,
    private _transactions: PaymentTransactionRecord[],
    private _delete: DeleteInfoVO,
    private readonly _version: Quantity,
    private readonly _createdAt: EffectiveDate,
  ) {
    super();
    if (_amount.value <= 0) throw new BadRequestError('Payment amount must be greater than zero.');
  }

  get id() {
    return this._id;
  }
  get orderId() {
    return this._orderId;
  }
  get buyerId() {
    return this._buyerId;
  }
  get provider() {
    return this._provider;
  }
  get amount() {
    return this._amount;
  }
  get capturedAmount() {
    return this._capturedAmount;
  }
  get refundedAmount() {
    return this._refundedAmount;
  }
  get status() {
    return this._status;
  }
  get currency() {
    return this._currency;
  }
  get providerRef() {
    return this._providerRef;
  }
  get transactions() {
    return [...this._transactions];
  }
  get delete() {
    return this._delete;
  }
  get version() {
    return this._version;
  }
  get createdAt() {
    return this._createdAt;
  }

  static create(data: CreatePaymentProps): PaymentAggregate {
    const currency = data.currency.trim().toUpperCase() || 'USD';
    return new PaymentAggregate(
      data.id,
      data.orderId,
      data.buyerId,
      data.provider,
      data.amount,
      Money.zero(),
      Money.zero(),
      PaymentStatusVO.pending(),
      currency,
      null,
      [],
      DeleteInfoVO.none(),
      Quantity.none(),
      EffectiveDate.today(),
    );
  }

  static rehydrate(
    id: Id,
    orderId: Id,
    buyerId: Id,
    provider: PaymentProviderVO,
    amount: Money,
    capturedAmount: Money,
    refundedAmount: Money,
    status: PaymentStatusVO,
    currency: string,
    providerRef: string | null,
    transactions: PaymentTransactionRecord[],
    del: DeleteInfoVO,
    version: Quantity,
    createdAt: EffectiveDate,
  ): PaymentAggregate {
    return new PaymentAggregate(
      id,
      orderId,
      buyerId,
      provider,
      amount,
      capturedAmount,
      refundedAmount,
      status,
      currency,
      providerRef,
      transactions,
      del,
      version,
      createdAt,
    );
  }

  createIntent() {
    this.raise(
      new PaymentIntentCreatedEvent({
        paymentId: this._id,
        orderId: this._orderId,
        buyerId: this._buyerId,
        provider: this._provider.value,
      }),
    );
  }

  attachProviderRef(providerRef: string | null) {
    if (providerRef) this._providerRef = providerRef;
  }

  authorize(providerRef: string | null) {
    this.ensureNotDeleted();
    this._status = this._status.authorize();
    if (providerRef) this._providerRef = providerRef;
    this._transactions = [
      ...this._transactions,
      {
        type: PaymentTransactionTypeVO.authorization(),
        amount: this._amount,
        providerRef: this._providerRef,
        reason: null,
        occurredAt: EffectiveDate.today(),
      },
    ];
    this.raise(
      new PaymentAuthorizedEvent({
        paymentId: this._id,
        orderId: this._orderId,
        providerRef: this._providerRef,
      }),
    );
  }

  capture(amount: Money | null, providerRef: string | null) {
    this.ensureNotDeleted();
    const captureAmount = amount ?? this._amount;
    if (captureAmount.value <= 0 || captureAmount.value > this._amount.value) {
      throw new BadRequestError('Capture amount must be > 0 and <= authorized amount.');
    }
    this._status = this._status.capture();
    this._capturedAmount = captureAmount;
    if (providerRef) this._providerRef = providerRef;
    this._transactions = [
      ...this._transactions,
      {
        type: PaymentTransactionTypeVO.capture(),
        amount: captureAmount,
        providerRef: this._providerRef,
        reason: null,
        occurredAt: EffectiveDate.today(),
      },
    ];
    this.raise(
      new PaymentCapturedEvent({
        paymentId: this._id,
        orderId: this._orderId,
        amount: captureAmount,
        providerRef: this._providerRef,
      }),
    );
  }

  fail(reason: Reason) {
    this.ensureNotDeleted();
    this._status = this._status.fail();
    this.raise(new PaymentFailedEvent({ paymentId: this._id, orderId: this._orderId, reason }));
  }

  cancel(reason: Reason | null) {
    this.ensureNotDeleted();
    this._status = this._status.cancel();
    this._transactions = [
      ...this._transactions,
      {
        type: PaymentTransactionTypeVO.void(),
        amount: Money.zero(),
        providerRef: this._providerRef,
        reason,
        occurredAt: EffectiveDate.today(),
      },
    ];
    this.raise(new PaymentCancelledEvent({ paymentId: this._id, orderId: this._orderId, reason }));
  }

  refund(amount: Money, reason: Reason) {
    this.ensureNotDeleted();
    const refundable = this._capturedAmount.value - this._refundedAmount.value;
    if (amount.value <= 0 || amount.value > refundable) {
      throw new BadRequestError(
        `Refund amount must be > 0 and <= refundable amount (${refundable}).`,
      );
    }
    const nextRefunded = this._refundedAmount.value + amount.value;
    const partial = nextRefunded < this._capturedAmount.value;
    this._status = this._status.refund(partial);
    this._refundedAmount = Money.create(nextRefunded);
    this._transactions = [
      ...this._transactions,
      {
        type: PaymentTransactionTypeVO.refund(),
        amount,
        providerRef: this._providerRef,
        reason,
        occurredAt: EffectiveDate.today(),
      },
    ];
    this.raise(
      new PaymentRefundedEvent({
        paymentId: this._id,
        orderId: this._orderId,
        amount,
        reason,
        partial,
      }),
    );
  }

  private ensureNotDeleted(): void {
    if (this._delete.isDeleted)
      throw new BadRequestError('Cannot perform operation on a deleted payment.');
  }
}
