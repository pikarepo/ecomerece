import { describe, expect, it } from 'bun:test';
import { PaymentAggregate } from '../payments/payments.aggregate';
import { PaymentProviderVO } from '../payments/value-objects/payment-provider.vo';
import { Id, Money, Reason } from '../../value-objects';

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
