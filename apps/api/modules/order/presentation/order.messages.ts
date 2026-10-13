import { EffectiveDate } from '@ecomerece/domain/value-objects/effective-date.vo';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
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
  orderDeleted(orderId: Id, actorId: Id, addressId: Id): OrderMessagesType {
    return {
      message: `Order ${orderId.value} was deleted by ${actorId.value} for address ${addressId.value} on ${EffectiveDate.today().value}.`,
    };
  },
};
