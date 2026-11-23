import { describe, expect, it } from 'bun:test';
import { BadRequestError } from '../../errors/app-error';
import { Id, Money, Reason } from '../../value-objects';
import { PaymentAggregate } from '../payments/payments.aggregate';
import { PaymentProviderVO } from '../payments/value-objects/payment-provider.vo';
import {
  PaymentStatusEnum,
  type PaymentStatusType,
  PaymentStatusVO,
} from '../payments/value-objects/payment-status.vo';

const base = () => ({
  id: Id.create('pay_0000000000000001'),
  orderId: Id.create('ord_0000000000000001'),
  buyerId: Id.create('usr_0000000000000001'),
  provider: PaymentProviderVO.create('manual'),
  amount: Money.create(100),
  currency: 'USD',
});

describe('PaymentAggregate', () => {
  it('creates intent and captures full amount', () => {
    const p = PaymentAggregate.create(base());
    p.createIntent();
    expect(p.status.value).toBe('pending');
    p.capture(null, 'ref_1');
    expect(p.status.value).toBe('captured');
    expect(p.capturedAmount.value).toBe(100);
    expect(p.transactions.length).toBe(1);
  });

  it('authorizes then captures', () => {
    const p = PaymentAggregate.create(base());
    p.createIntent();
    p.authorize('auth_1');
    expect(p.status.value).toBe('authorized');
    p.capture(Money.create(100), 'cap_1');
    expect(p.status.value).toBe('captured');
  });

  it('supports partial and full refund of captured payment', () => {
    const p = PaymentAggregate.create(base());
    p.createIntent();
    p.capture(null, 'cap_1');
    p.refund(Money.create(40), Reason.create('partial refund reason'));
    expect(p.status.value).toBe('partially_refunded');
    expect(p.refundedAmount.value).toBe(40);
    p.refund(Money.create(60), Reason.create('remaining refund reason'));
    expect(p.status.value).toBe('refunded');
    expect(p.refundedAmount.value).toBe(100);
  });

  it('rejects refund over refundable amount', () => {
    const p = PaymentAggregate.create(base());
    p.createIntent();
    p.capture(null, 'cap_1');
    expect(() => p.refund(Money.create(120), Reason.create('refund amount too much'))).toThrow();
  });
});

function domainEvidence(tag: string, data: Record<string, unknown>) {
  console.log(`[DOM-${tag}] ${JSON.stringify(data)}`);
}

describe('hostile payment status transitions and rehydration', () => {
  it('DOM-T7-CONTROL pending status can capture and fail', () => {
    expect(PaymentStatusVO.pending().capture().value).toBe(PaymentStatusEnum.CAPTURED);
    expect(PaymentStatusVO.pending().fail().value).toBe(PaymentStatusEnum.FAILED);
    expect(() => PaymentStatusVO.rehydrate(PaymentStatusEnum.CAPTURED).fail()).toThrow(
      BadRequestError,
    );
  });

  it.failing('DOM-T7 fail and cancel allow partially refunded and terminal transitions', () => {
    expect(PaymentStatusVO.pending().capture().value).toBe(PaymentStatusEnum.CAPTURED);
    const partial = PaymentStatusVO.rehydrate(PaymentStatusEnum.PARTIALLY_REFUNDED);
    const failed = PaymentStatusVO.rehydrate(PaymentStatusEnum.FAILED);
    const cancelled = PaymentStatusVO.rehydrate(PaymentStatusEnum.CANCELLED);
    const exploit = {
      partiallyRefundedFail: partial.fail().value,
      partiallyRefundedCancel: partial.cancel().value,
      failedFail: failed.fail().value,
      failedCancel: failed.cancel().value,
      cancelledFail: cancelled.fail().value,
      cancelledCancel: cancelled.cancel().value,
    };

    domainEvidence('T7', exploit);
    expect(() => partial.fail()).toThrow(BadRequestError);
    expect(() => partial.cancel()).toThrow(BadRequestError);
    expect(() => failed.fail()).toThrow(BadRequestError);
    expect(() => failed.cancel()).toThrow(BadRequestError);
    expect(() => cancelled.fail()).toThrow(BadRequestError);
    expect(() => cancelled.cancel()).toThrow(BadRequestError);
  });

  it.failing('DOM-T9B payment status rehydration accepts a bogus value', () => {
    expect(PaymentStatusVO.fromString(PaymentStatusEnum.FAILED).value).toBe(
      PaymentStatusEnum.FAILED,
    );
    expect(() => PaymentStatusVO.fromString('bogus')).toThrow(BadRequestError);
    const bogus: string = 'bogus';
    const exploit = PaymentStatusVO.rehydrate(bogus as PaymentStatusType);

    domainEvidence('T9B', { status: exploit.value });
    expect(() => PaymentStatusVO.rehydrate(bogus as PaymentStatusType)).toThrow(BadRequestError);
  });
});
