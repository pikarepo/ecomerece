import {
  type ReturnListItemReadModel,
  type ReturnReadModel,
  ReturnRequestAggregate,
} from '@ecomerece/domain';
import { ReturnStatusVO } from '@ecomerece/domain/modules/returns/value-objects/return-status.vo';
import { ReturnTypeVO } from '@ecomerece/domain/modules/returns/value-objects/return-type.vo';
import { DeleteInfoVO } from '@ecomerece/domain/value-objects/delete-info.vo';
import { EffectiveDate } from '@ecomerece/domain/value-objects/effective-date.vo';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import { Reason } from '@ecomerece/domain/value-objects/reason.vo';
import type { ReturnListItemResponseReadModel, ReturnResponseReadModel } from '@ecomerece/shared';
import type { ReturnPersistence } from './return.model';

function toDate(value: Date | null): Date | null {
  return value ? new Date(value) : null;
}

export const ReturnMapper = {
  persistenceToAggregate(doc: ReturnPersistence): ReturnRequestAggregate {
    return ReturnRequestAggregate.rehydrate(
      Id.create(doc._id),
      Id.create(doc.orderId),
      Id.create(doc.orderItemId),
      Id.create(doc.vendorId),
      Id.create(doc.buyerId),
      Quantity.create(doc.quantity),
      ReturnTypeVO.rehydrate(doc.returnType),
      Reason.create(doc.reason),
      ReturnStatusVO.fromString(doc.status),
      doc.decisionReason ? Reason.create(doc.decisionReason) : null,
      EffectiveDate.rehydrate(doc.requestedAt),
      doc.decidedAt ? EffectiveDate.rehydrate(doc.decidedAt) : null,
      doc.receivedAt ? EffectiveDate.rehydrate(doc.receivedAt) : null,
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

  aggregateToPersistence(request: ReturnRequestAggregate) {
    return {
      _id: request.id.value,
      orderId: request.orderId.value,
      orderItemId: request.orderItemId.value,
      vendorId: request.vendorId.value,
      buyerId: request.buyerId.value,
      quantity: request.quantity.value,
      returnType: request.returnType.value,
      reason: request.reason.value,
      status: request.status.value,
      decisionReason: request.decisionReason?.value ?? null,
      requestedAt: request.requestedAt.value,
      decidedAt: request.decidedAt?.value ?? null,
      receivedAt: request.receivedAt?.value ?? null,
      version: request.version.value,
      deleted: {
        deleted: request.delete.deleted,
        deletedFrom: request.delete.from?.value ?? null,
        deletedBy: request.delete.performedBy?.value ?? null,
        reason: request.delete.reason?.value ?? null,
      },
      createdAt: request.createdAt.value,
      updatedAt: EffectiveDate.today().value,
    };
  },

  aggregateToReadModel(request: ReturnRequestAggregate): ReturnReadModel {
    return {
      id: request.id.value,
      orderId: request.orderId.value,
      orderItemId: request.orderItemId.value,
      vendorId: request.vendorId.value,
      buyerId: request.buyerId.value,
      quantity: request.quantity.value,
      returnType: request.returnType.value,
      reason: request.reason.value,
      status: request.status.value,
      decisionReason: request.decisionReason?.value ?? null,
      requestedAt: request.requestedAt.value,
      decidedAt: request.decidedAt?.value ?? null,
      receivedAt: request.receivedAt?.value ?? null,
      deleted: {
        deleted: request.delete.deleted,
        deletedFrom: request.delete.from?.value ?? null,
        deletedBy: request.delete.performedBy?.value ?? null,
        reason: request.delete.reason?.value ?? null,
      },
      createdAt: request.createdAt.value,
    };
  },

  persistenceToReadModel(doc: ReturnPersistence): ReturnReadModel {
    return {
      id: doc._id,
      orderId: doc.orderId,
      orderItemId: doc.orderItemId,
      vendorId: doc.vendorId,
      buyerId: doc.buyerId,
      quantity: doc.quantity,
      returnType: doc.returnType,
      reason: doc.reason,
      status: doc.status,
      decisionReason: doc.decisionReason ?? null,
      requestedAt: doc.requestedAt,
      decidedAt: toDate(doc.decidedAt),
      receivedAt: toDate(doc.receivedAt),
      deleted: {
        deleted: doc.deleted.deleted,
        deletedFrom: doc.deleted.deletedFrom ?? null,
        deletedBy: doc.deleted.deletedBy ?? null,
        reason: doc.deleted.reason ?? null,
      },
      createdAt: doc.createdAt,
    };
  },

  aggregateToResponseReadModel(request: ReturnRequestAggregate): ReturnResponseReadModel {
    return {
      id: request.id.value,
      orderId: request.orderId.value,
      orderItemId: request.orderItemId.value,
      vendorId: request.vendorId.value,
      buyerId: request.buyerId.value,
      quantity: request.quantity.value,
      returnType: request.returnType.value,
      reason: request.reason.value,
      status: request.status.value,
      decisionReason: request.decisionReason?.value ?? null,
      requestedAt: request.requestedAt.value,
      decidedAt: request.decidedAt?.value ?? null,
      receivedAt: request.receivedAt?.value ?? null,
      createdAt: request.createdAt.value,
    };
  },

  aggregateToListItemReadModel(request: ReturnRequestAggregate): ReturnListItemResponseReadModel {
    return {
      id: request.id.value,
      orderId: request.orderId.value,
      orderItemId: request.orderItemId.value,
      quantity: request.quantity.value,
      returnType: request.returnType.value,
      status: request.status.value,
      requestedAt: request.requestedAt.value,
      createdAt: request.createdAt.value,
    };
  },
};
