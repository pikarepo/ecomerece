import { type OrderItemReadModel, OrderItemsAggregate, StatusVo } from '@ecomerece/domain';
import { DeleteInfoVO } from '@ecomerece/domain/value-objects/delete-info.vo';
import { EffectiveDate } from '@ecomerece/domain/value-objects/effective-date.vo';
import { ExpirationDate } from '@ecomerece/domain/value-objects/expiration-date.vo';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { Money } from '@ecomerece/domain/value-objects/money.vo';
import { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import { Reason } from '@ecomerece/domain/value-objects/reason.vo';
import type { OrderItemResponseReadModel } from '@ecomerece/shared';
import type { OrderItemsPersistence } from './order-item.model';

export const OrderItemsMapper = {
  persistenceToAggregate(doc: OrderItemsPersistence): OrderItemsAggregate {
    if (doc.failureReason) {
      throw new Error('A failed order item cannot be rehydrated as an aggregate.');
    }
    return OrderItemsAggregate.rehydrate(
      Id.rehydrate(doc._id),
      Id.rehydrate(doc.orderId),
      Id.rehydrate(doc.vendorId as string),
      Id.rehydrate(doc.productId as string),
      Id.rehydrate(doc.variantId),
      Quantity.rehydrate(doc.quantity),
      ExpirationDate.rehydrate(doc.waitingTime),
      StatusVo.rehydrate(doc.status),
      Money.rehydrate(doc.totalPrice),
      Money.rehydrate(doc.price as number),
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
  /**
   * Rebuilds a rejected line as a pending aggregate with a fresh quote. The
   * transition rules live in `OrderItemsAggregate.restoreFromFailure`.
   */
  persistenceToRestoredAggregate(
    doc: OrderItemsPersistence,
    quote: { productId: Id; vendorId: Id; price: Money },
  ): OrderItemsAggregate {
    return OrderItemsAggregate.restoreFromFailure({
      id: Id.rehydrate(doc._id),
      orderId: Id.rehydrate(doc.orderId),
      variantId: Id.rehydrate(doc.variantId),
      quantity: Quantity.rehydrate(doc.quantity),
      waitingTime: ExpirationDate.rehydrate(doc.waitingTime),
      status: doc.status,
      failureReason: doc.failureReason,
      productId: quote.productId,
      vendorId: quote.vendorId,
      price: quote.price,
      version: Quantity.rehydrate(doc.version),
      createdAt: EffectiveDate.rehydrate(doc.createdAt),
    });
  },

  aggregateToPersistence(items: OrderItemsAggregate) {
    return {
      _id: items.id.value,
      quantity: items.quantity.value,
      waitingTime: items.waitingTime.value,
      status: items.status.toStatusType(),
      totalPrice: items.totalPrice.value,
      price: items.price.value,
      orderId: items.orderId.value,
      vendorId: items.vendorId.value,
      productId: items.productId.value,
      variantId: items.variantId.value,
      failureReason: null,
      version: items.version.value,
      deleted: {
        deleted: items.delete.deleted,
        deletedFrom: items.delete.from?.value ?? null,
        deletedBy: items.delete.performedBy?.value ?? null,
        reason: items.delete.reason?.value ?? null,
      },
      createdAt: items.createdAt.value,
    };
  },
  aggregateToReadModel(items: OrderItemsAggregate): OrderItemReadModel {
    return {
      _id: items.id.value,
      orderId: items.orderId.value,
      vendorId: items.vendorId.value,
      productId: items.productId.value,
      variantId: items.variantId.value,
      quantity: items.quantity.value,
      waitingTime: items.waitingTime.value,
      status: items.status.toStatusType(),
      totalPrice: items.totalPrice.value,
      price: items.price.value,
      failureReason: null,
      delete: {
        deleted: items.delete.deleted,
        deletedFrom: items.delete.from?.value ?? null,
        deletedBy: items.delete.performedBy?.value ?? null,
        reason: items.delete.reason?.value ?? null,
      },
      createdAt: items.createdAt.value,
    };
  },

  persistenceToReadModel(doc: OrderItemsPersistence): OrderItemReadModel {
    return {
      _id: doc._id,
      orderId: doc.orderId,
      vendorId: doc.vendorId,
      productId: doc.productId,
      variantId: doc.variantId,
      quantity: doc.quantity,
      waitingTime: doc.waitingTime,
      status: doc.status,
      totalPrice: doc.totalPrice,
      price: doc.price,
      failureReason: doc.failureReason,
      delete: {
        deleted: doc.deleted.deleted,
        deletedFrom: doc.deleted.deletedFrom ?? null,
        deletedBy: doc.deleted.deletedBy ?? null,
        reason: doc.deleted.reason ?? null,
      },
      createdAt: doc.createdAt,
    };
  },

  aggregateToResponseReadModel(items: OrderItemsAggregate): OrderItemResponseReadModel {
    return {
      _id: items.id.value,
      orderId: items.orderId.value,
      vendorId: items.vendorId.value,
      productId: items.productId.value,
      variantId: items.variantId.value,
      quantity: items.quantity.value,
      waitingTime: items.waitingTime.value,
      status: items.status.toStatusType(),
      totalPrice: items.totalPrice.value,
      price: items.price.value,
      failureReason: null,

      createdAt: items.createdAt.value,
    };
  },

  persistenceToResponseReadModel(doc: OrderItemsPersistence): OrderItemResponseReadModel {
    return {
      _id: doc._id,
      orderId: doc.orderId,
      vendorId: doc.vendorId,
      productId: doc.productId,
      variantId: doc.variantId,
      quantity: doc.quantity,
      waitingTime: doc.waitingTime,
      status: doc.status,
      totalPrice: doc.totalPrice,
      price: doc.price,
      failureReason: doc.failureReason,

      createdAt: doc.createdAt,
    };
  },
};
