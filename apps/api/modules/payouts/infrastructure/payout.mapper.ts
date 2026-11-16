import { LedgerEntryAggregate, PayoutAggregate } from '@ecomerece/domain';
import { LedgerEntryTypeVO } from '@ecomerece/domain/modules/payouts/value-objects/ledger-entry-type.vo';
import { PayoutStatusVO } from '@ecomerece/domain/modules/payouts/value-objects/payout-status.vo';
import { EffectiveDate, Id, Money, Quantity, Reason } from '@ecomerece/domain/value-objects';
import type { LedgerEntryResponseReadModel, PayoutResponseReadModel } from '@ecomerece/shared';
import type { LedgerPersistence, PayoutPersistence } from './payout.model';

export const PayoutMapper = {
  payoutToPersistence(p: PayoutAggregate) {
    return {
      _id: p.id.value,
      vendorId: p.vendorId.value,
      amount: p.amount.value,
      currency: p.currency,
      status: p.status.value,
      method: p.method,
      destinationRef: p.destinationRef,
      providerRef: p.providerRef,
      failureReason: p.failureReason?.value ?? null,
      version: p.version.value,
      createdAt: p.createdAt.value,
      updatedAt: EffectiveDate.today().value,
    };
  },
  persistenceToPayout(d: PayoutPersistence): PayoutAggregate {
    return PayoutAggregate.rehydrate(
      Id.create(d._id),
      Id.create(d.vendorId),
      Money.rehydrate(d.amount),
      d.currency,
      PayoutStatusVO.fromString(d.status),
      d.method,
      d.destinationRef ?? null,
      d.providerRef ?? null,
      d.failureReason ? Reason.create(d.failureReason) : null,
      Quantity.rehydrate(d.version),
      EffectiveDate.rehydrate(d.createdAt),
    );
  },
  payoutToResponse(p: PayoutAggregate): PayoutResponseReadModel {
    return {
      id: p.id.value,
      vendorId: p.vendorId.value,
      amount: p.amount.value,
      currency: p.currency,
      status: p.status.value,
      method: p.method,
      destinationRef: p.destinationRef,
      providerRef: p.providerRef,
      failureReason: p.failureReason?.value ?? null,
      createdAt: p.createdAt.value,
    };
  },
  ledgerToPersistence(e: LedgerEntryAggregate) {
    return {
      _id: e.id.value,
      vendorId: e.vendorId.value,
      type: e.type.value,
      amount: e.amount,
      currency: e.currency,
      referenceType: e.referenceType,
      referenceId: e.referenceId,
      note: e.note,
      version: e.version.value,
      createdAt: e.createdAt.value,
      updatedAt: EffectiveDate.today().value,
    };
  },
  persistenceToLedger(d: LedgerPersistence): LedgerEntryAggregate {
    return LedgerEntryAggregate.rehydrate(
      Id.create(d._id),
      Id.create(d.vendorId),
      LedgerEntryTypeVO.rehydrate(d.type as never),
      d.amount,
      d.currency,
      d.referenceType ?? null,
      d.referenceId ?? null,
      d.note ?? null,
      Quantity.rehydrate(d.version),
      EffectiveDate.rehydrate(d.createdAt),
    );
  },
  ledgerToResponse(e: LedgerEntryAggregate): LedgerEntryResponseReadModel {
    return {
      id: e.id.value,
      vendorId: e.vendorId.value,
      type: e.type.value,
      amount: e.amount,
      currency: e.currency,
      referenceType: e.referenceType,
      referenceId: e.referenceId,
      note: e.note,
      createdAt: e.createdAt.value,
    };
  },
};
