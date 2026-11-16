import { describe, expect, it } from 'bun:test';
import { PayoutAggregate } from '../payouts/payout.aggregate';
import { LedgerEntryAggregate } from '../payouts/ledger-entry.aggregate';
import { LedgerEntryTypeVO } from '../payouts/value-objects/ledger-entry-type.vo';
import { Id, Money, Reason } from '../../value-objects';

describe('PayoutAggregate', () => {
  it('walks request -> approve -> paid', () => {
    const p = PayoutAggregate.create({ id: Id.create('po_0000000000000001'), vendorId: Id.create('v_00000000000000001'), amount: Money.create(50), currency: 'USD', method: 'manual', destinationRef: null });
    p.request();
    expect(p.status.value).toBe('requested');
    p.approve(Id.create('admin_000000000001'));
    p.markProcessing();
    p.markPaid('ref');
    expect(p.status.value).toBe('paid');
    expect(p.providerRef).toBe('ref');
  });

  it('fails and stores reason', () => {
    const p = PayoutAggregate.create({ id: Id.create('po_0000000000000002'), vendorId: Id.create('v_00000000000000001'), amount: Money.create(50), currency: 'USD', method: 'manual', destinationRef: null });
    p.request();
    p.approve(Id.create('admin_000000000001'));
    p.markFailed(Reason.create('bank error'));
    expect(p.status.value).toBe('failed');
    expect(p.failureReason?.value).toBe('bank error');
  });
});

describe('LedgerEntryAggregate', () => {
  it('creates signed credit and debit entries', () => {
    const credit = LedgerEntryAggregate.create({ id: Id.create('le_0000000000000001'), vendorId: Id.create('v_00000000000000001'), type: LedgerEntryTypeVO.create('sale_credit'), amount: 100, currency: 'USD', referenceType: 'order', referenceId: 'o1', note: null });
    const debit = LedgerEntryAggregate.create({ id: Id.create('le_0000000000000002'), vendorId: Id.create('v_00000000000000001'), type: LedgerEntryTypeVO.create('commission_debit'), amount: -10, currency: 'USD', referenceType: 'order', referenceId: 'o1', note: null });
    expect(credit.amount).toBe(100);
    expect(debit.amount).toBe(-10);
  });
});
