import { EffectiveDate } from '@ecomerece/domain/value-objects/effective-date.vo';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';

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
};
