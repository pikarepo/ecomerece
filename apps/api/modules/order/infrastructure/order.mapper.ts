import { OrderAggregate, type OrderReadModel } from '@ecomerece/domain';
import { DeleteInfoVO } from '@ecomerece/domain/value-objects/delete-info.vo';
import { EffectiveDate } from '@ecomerece/domain/value-objects/effective-date.vo';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { Money } from '@ecomerece/domain/value-objects/money.vo';
import { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import { Reason } from '@ecomerece/domain/value-objects/reason.vo';
import { FullAddressVO } from '@ecomerece/domain/value-objects/street-address.vo';
import type { OrderResponseReadModel } from '@ecomerece/shared';
import type { OrderPersistence } from './order.model';

export const OrderMapper = {
  persistenceToAggregate(doc: OrderPersistence): OrderAggregate {
    return OrderAggregate.rehydrate(
      Id.create(doc.idempotentKey),
      Id.create(doc._id),
      Id.create(doc.buyerId),
      Money.rehydrate(doc.totalPrice),
      FullAddressVO.create(doc.address),
      DeleteInfoVO.rehydrate(
        doc.deleted.deletedBy ? Id.create(doc.deleted.deletedBy) : null,
        doc.deleted.deleted,
        doc.deleted.deletedFrom ? EffectiveDate.create(doc.deleted.deletedFrom) : null,
        doc.deleted.reason ? Reason.create(doc.deleted.reason) : null,
      ),
      Quantity.rehydrate(doc.version),
      EffectiveDate.rehydrate(doc.createdAt),
    );
  },
  aggregateToPersistence(order: OrderAggregate) {
    return {
      _id: order.id.value,
      idempotentKey: order.idempotentKey.value,
      buyerId: order.buyerId.value,
      totalPrice: order.totalPrice.value,
      address: order.address.value,
      deleted: {
        deleted: order.delete.deleted,
        deletedFrom: order.delete.from?.value ?? null,
        deletedBy: order.delete.performedBy?.value ?? null,
        reason: order.delete.reason?.value ?? null,
      },
      createdAt: order.createdAt.value,
      updatedAt: EffectiveDate.today().value,
    };
  },
  aggregateToReadModel(order: OrderAggregate): OrderReadModel {
    return {
      id: order.id.value,
      buyerId: order.buyerId.value,
      totalPrice: order.totalPrice.value,
      address: order.address.value,
      deleted: {
        deleted: order.delete.deleted,
        deletedFrom: order.delete.from?.value ?? null,
        deletedBy: order.delete.performedBy?.value ?? null,
        reason: order.delete.reason?.value ?? null,
      },
      createdAt: order.createdAt.value,
    };
  },
  persistenceToReadModel(doc: OrderPersistence): OrderReadModel {
    return {
      id: doc._id,
      buyerId: doc.buyerId,
      totalPrice: doc.totalPrice,

      address: doc.address,
      deleted: {
        deleted: doc.deleted.deleted,
        deletedFrom: doc.deleted.deletedFrom ?? null,
        deletedBy: doc.deleted.deletedBy ?? null,
        reason: doc.deleted.reason ?? null,
      },

      createdAt: doc.createdAt,
    };
  },
  aggregateToResponseReadModel(order: OrderAggregate): OrderResponseReadModel {
    return {
      id: order.id.value,
      buyerId: order.buyerId.value,
      totalPrice: order.totalPrice.value,
      address: order.address.value,
      createdAt: order.createdAt.value,
    };
  },
};
