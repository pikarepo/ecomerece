import { EffectiveDate } from '@ecomerece/domain/value-objects/effective-date.vo';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { Reason } from '@ecomerece/domain/value-objects/reason.vo';

export type OrderItemsMessagesType = {
  message: string;
};

export const OrderItemsMessages = {
  orderItemsCancelled(orderId: Id, actorId: Id, count: number): OrderItemsMessagesType {
    return {
      message: `${count} order item(s) from order ${orderId.value} were cancelled by ${actorId.value} on ${EffectiveDate.today().value}.`,
    };
  },
  orderItemStatusChanged(itemId: Id, actorId: Id, status: string): OrderItemsMessagesType {
    return {
      message: `Order item ${itemId.value} was ${status} by ${actorId.value} on ${EffectiveDate.today().value}.`,
    };
  },
  orderItemUpdated(itemId: Id, actorId: Id): OrderItemsMessagesType {
    return {
      message: `Order item ${itemId.value} was updated by ${actorId.value} on ${EffectiveDate.today().value}.`,
    };
  },
  orderItemDeleted(itemId: Id, actorId: Id, reason: Reason): OrderItemsMessagesType {
    return {
      message: `Order item ${itemId.value} was deleted by ${actorId.value} on ${EffectiveDate.today().value}. Reason: ${reason.value}.`,
    };
  },
  orderItemRecovered(itemId: Id, actorId: Id): OrderItemsMessagesType {
    return {
      message: `Order item ${itemId.value} was recovered by ${actorId.value} on ${EffectiveDate.today().value}.`,
    };
  },
};
