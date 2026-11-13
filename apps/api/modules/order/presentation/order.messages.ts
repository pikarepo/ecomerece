import { EffectiveDate } from '@ecomerece/domain/value-objects/effective-date.vo';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { Reason } from '@ecomerece/domain/value-objects/reason.vo';
import type { OrderResponseReadModel } from '@ecomerece/shared';

export type OrderMessagesType = {
  updatedData?: OrderResponseReadModel;
  message: string;
};

export const OrderMessages = {
  orderCreated(
    orderId: Id,
    actorId: Id,
    addressId: Id,
    updatedData: OrderResponseReadModel,
  ): OrderMessagesType {
    return {
      updatedData,
      message: `Order ${orderId.value} was created by ${actorId.value} for address ${addressId.value} on ${EffectiveDate.today().value}.`,
    };
  },
  orderUpdated(orderId: Id, actorId: Id): OrderMessagesType {
    return {
      message: `Order ${orderId.value} was updated by ${actorId.value} on ${EffectiveDate.today().value}.`,
    };
  },
  orderDeleted(orderId: Id, actorId: Id, reason: Reason): OrderMessagesType {
    return {
      message: `Order ${orderId.value} was deleted by ${actorId.value} on ${EffectiveDate.today().value}. Reason: ${reason.value}.`,
    };
  },
  orderItemsRetried(
    orderId: Id,
    actorId: Id,
    restoredCount: number,
    remainingCount: number,
    totalPrice: number,
    updatedData: OrderResponseReadModel,
  ): OrderMessagesType {
    return {
      updatedData,
      message: `Order ${orderId.value}: ${restoredCount} item(s) restored, ${remainingCount} still unfulfilled, by ${actorId.value} on ${EffectiveDate.today().value}. New total: ${totalPrice}.`,
    };
  },
  orderRecovered(orderId: Id, actorId: Id): OrderMessagesType {
    return {
      message: `Order ${orderId.value} was recovered by ${actorId.value} on ${EffectiveDate.today().value}.`,
    };
  },
  orderConfirmed(orderId: Id, actorId: Id): OrderMessagesType {
    return {
      message: `Order ${orderId.value} was confirmed by ${actorId.value} on ${EffectiveDate.today().value}.`,
    };
  },
  orderCompleted(orderId: Id, actorId: Id): OrderMessagesType {
    return {
      message: `Order ${orderId.value} was completed by ${actorId.value} on ${EffectiveDate.today().value}.`,
    };
  },
  orderCancelled(orderId: Id, actorId: Id, reason: Reason): OrderMessagesType {
    return {
      message: `Order ${orderId.value} was cancelled by ${actorId.value} on ${EffectiveDate.today().value}. Reason: ${reason.value}.`,
    };
  },
  orderReturned(orderId: Id, actorId: Id, reason: Reason): OrderMessagesType {
    return {
      message: `Order ${orderId.value} was returned by ${actorId.value} on ${EffectiveDate.today().value}. Reason: ${reason.value}.`,
    };
  },
  orderRefunded(orderId: Id, actorId: Id, reason: Reason): OrderMessagesType {
    return {
      message: `Order ${orderId.value} was refunded by ${actorId.value} on ${EffectiveDate.today().value}. Reason: ${reason.value}.`,
    };
  },
};
