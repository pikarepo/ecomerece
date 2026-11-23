import { describe, expect, it } from 'bun:test';
import { BadRequestError } from '../../errors/app-error';
import { Id, Money, Reason } from '../../value-objects';
import { LedgerEntryAggregate } from '../payouts/ledger-entry.aggregate';
import { PayoutAggregate } from '../payouts/payout.aggregate';
import { LedgerEntryTypeVO } from '../payouts/value-objects/ledger-entry-type.vo';
import {
  PayoutStatusEnum,
  type PayoutStatusType,
  PayoutStatusVO,
} from '../payouts/value-objects/payout-status.vo';

describe('PayoutAggregate', () => {
  it('walks request -> approve -> paid', () => {
    const p = PayoutAggregate.create({
      id: Id.create('po_0000000000000001'),
      vendorId: Id.create('v_00000000000000001'),
      amount: Money.create(50),
      currency: 'USD',
      method: 'manual',
      destinationRef: null,
    });
    p.request();
    expect(p.status.value).toBe('requested');
    p.approve(Id.create('admin_000000000001'));
    p.markProcessing();
    p.markPaid('ref');
    expect(p.status.value).toBe('paid');
    expect(p.providerRef).toBe('ref');
  });

  it('fails and stores reason', () => {
    const p = PayoutAggregate.create({
      id: Id.create('po_0000000000000002'),
      vendorId: Id.create('v_00000000000000001'),
      amount: Money.create(50),
      currency: 'USD',
      method: 'manual',
      destinationRef: null,
    });
    p.request();
    p.approve(Id.create('admin_000000000001'));
    p.markFailed(Reason.create('bank error'));
    expect(p.status.value).toBe('failed');
    expect(p.failureReason?.value).toBe('bank error');
  });
});

describe('LedgerEntryAggregate', () => {
  it('creates signed credit and debit entries', () => {
    const credit = LedgerEntryAggregate.create({
      id: Id.create('le_0000000000000001'),
      vendorId: Id.create('v_00000000000000001'),
      type: LedgerEntryTypeVO.create('sale_credit'),
      amount: 100,
      currency: 'USD',
      referenceType: 'order',
      referenceId: 'o1',
      note: null,
    });
    const debit = LedgerEntryAggregate.create({
      id: Id.create('le_0000000000000002'),
      vendorId: Id.create('v_00000000000000001'),
      type: LedgerEntryTypeVO.create('commission_debit'),
      amount: -10,
      currency: 'USD',
      referenceType: 'order',
      referenceId: 'o1',
      note: null,
    });
    expect(credit.amount).toBe(100);
    expect(debit.amount).toBe(-10);
  });
});

function domainEvidence(tag: string, data: Record<string, unknown>) {
  console.log(`[DOM-${tag}] ${JSON.stringify(data)}`);
}

describe('hostile payout status transitions and rehydration', () => {
  it('DOM-T8-CONTROL valid payout transitions stay in the lifecycle', () => {
    expect(PayoutStatusVO.requested().approve().value).toBe(PayoutStatusEnum.APPROVED);
    const approved = PayoutStatusVO.rehydrate(PayoutStatusEnum.APPROVED);
    expect(approved.process().value).toBe(PayoutStatusEnum.PROCESSING);
    expect(approved.markPaid().value).toBe(PayoutStatusEnum.PAID);
    expect(PayoutStatusVO.requested().fail().value).toBe(PayoutStatusEnum.FAILED);
    expect(PayoutStatusVO.requested().cancel().value).toBe(PayoutStatusEnum.CANCELLED);
  });

  it.failing('DOM-T8 fail and cancel flip failed and cancelled payouts', () => {
    expect(() => PayoutStatusVO.fromString(PayoutStatusEnum.PAID).fail()).toThrow(BadRequestError);
    const failed = PayoutStatusVO.rehydrate(PayoutStatusEnum.FAILED);
    const cancelled = PayoutStatusVO.rehydrate(PayoutStatusEnum.CANCELLED);
    const exploit = {
      failedFail: failed.fail().value,
      failedCancel: failed.cancel().value,
      cancelledFail: cancelled.fail().value,
      cancelledCancel: cancelled.cancel().value,
    };

    domainEvidence('T8', exploit);
    expect(() => failed.fail()).toThrow(BadRequestError);
    expect(() => failed.cancel()).toThrow(BadRequestError);
    expect(() => cancelled.fail()).toThrow(BadRequestError);
    expect(() => cancelled.cancel()).toThrow(BadRequestError);
  });

  it.failing('DOM-T9C payout status rehydration accepts a bogus value', () => {
    expect(() => PayoutStatusVO.fromString('bogus')).toThrow(BadRequestError);
    const bogus: string = 'bogus';
    const exploit = PayoutStatusVO.rehydrate(bogus as PayoutStatusType);

    domainEvidence('T9C', { status: exploit.value });
    expect(() => PayoutStatusVO.rehydrate(bogus as PayoutStatusType)).toThrow(BadRequestError);
  });
});
