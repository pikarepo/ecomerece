import { PaymentAggregate } from '@ecomerece/domain';
import { PaymentProviderVO } from '@ecomerece/domain/modules/payments/value-objects/payment-provider.vo';
import { PaymentStatusVO } from '@ecomerece/domain/modules/payments/value-objects/payment-status.vo';
import { PaymentTransactionTypeVO } from '@ecomerece/domain/modules/payments/value-objects/transaction-type.vo';
import { DeleteInfoVO } from '@ecomerece/domain/value-objects/delete-info.vo';
import { EffectiveDate } from '@ecomerece/domain/value-objects/effective-date.vo';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { Money } from '@ecomerece/domain/value-objects/money.vo';
import { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import { Reason } from '@ecomerece/domain/value-objects/reason.vo';
import type { PaymentListItemResponseReadModel, PaymentResponseReadModel } from '@ecomerece/shared';
import type { PaymentPersistence } from './payment.model';

export const PaymentMapper = {
  persistenceToAggregate(doc: PaymentPersistence): PaymentAggregate {
    return PaymentAggregate.rehydrate(
      Id.create(doc._id),
      Id.create(doc.orderId),
      Id.create(doc.buyerId),
      PaymentProviderVO.rehydrate(doc.provider),
      Money.rehydrate(doc.amount),
      Money.rehydrate(doc.capturedAmount),
      Money.rehydrate(doc.refundedAmount),
      PaymentStatusVO.fromString(doc.status),
      doc.currency,
      doc.providerRef ?? null,
      (doc.transactions ?? []).map((t) => ({
        type: PaymentTransactionTypeVO.rehydrate(t.type as never),
        amount: Money.rehydrate(t.amount),
        providerRef: t.providerRef ?? null,
        reason: t.reason ? Reason.create(t.reason) : null,
        occurredAt: EffectiveDate.rehydrate(t.occurredAt),
      })),
      DeleteInfoVO.rehydrate(
        doc.deleted.deletedBy ? Id.create(doc.deleted.deletedBy) : null,
        doc.deleted.deleted,
        doc.deleted.deletedFrom ? EffectiveDate.rehydrate(doc.deleted.deletedFrom) : null,
        doc.deleted.reason ? Reason.create(doc.deleted.reason) : null,
      ),
      Quantity.rehydrate(doc.version),
      EffectiveDate.rehydrate(doc.createdAt),
    );
  },

  aggregateToPersistence(p: PaymentAggregate) {
    return {
      _id: p.id.value,
      orderId: p.orderId.value,
      buyerId: p.buyerId.value,
      provider: p.provider.value,
      amount: p.amount.value,
      capturedAmount: p.capturedAmount.value,
      refundedAmount: p.refundedAmount.value,
      currency: p.currency,
      status: p.status.value,
      providerRef: p.providerRef,
      transactions: p.transactions.map((t) => ({
        type: t.type.value,
        amount: t.amount.value,
        providerRef: t.providerRef,
        reason: t.reason?.value ?? null,
        occurredAt: t.occurredAt.value,
      })),
      version: p.version.value,
      deleted: {
        deleted: p.delete.deleted,
        deletedFrom: p.delete.from?.value ?? null,
        deletedBy: p.delete.performedBy?.value ?? null,
        reason: p.delete.reason?.value ?? null,
      },
      createdAt: p.createdAt.value,
      updatedAt: EffectiveDate.today().value,
    };
  },

  aggregateToResponseReadModel(p: PaymentAggregate): PaymentResponseReadModel {
    return {
      id: p.id.value,
      orderId: p.orderId.value,
      buyerId: p.buyerId.value,
      provider: p.provider.value,
      amount: p.amount.value,
      capturedAmount: p.capturedAmount.value,
      refundedAmount: p.refundedAmount.value,
      currency: p.currency,
      status: p.status.value,
      providerRef: p.providerRef,
      transactions: p.transactions.map((t) => ({
        type: t.type.value,
        amount: t.amount.value,
        providerRef: t.providerRef,
        reason: t.reason?.value ?? null,
        occurredAt: t.occurredAt.value,
      })),
      createdAt: p.createdAt.value,
    };
  },

  aggregateToListItemReadModel(p: PaymentAggregate): PaymentListItemResponseReadModel {
    return {
      id: p.id.value,
      orderId: p.orderId.value,
      buyerId: p.buyerId.value,
      provider: p.provider.value,
      amount: p.amount.value,
      currency: p.currency,
      status: p.status.value,
      createdAt: p.createdAt.value,
    };
  },
};
