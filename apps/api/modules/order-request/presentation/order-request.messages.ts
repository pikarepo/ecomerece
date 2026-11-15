import type { OrderRequestReadModel } from '@ecomerece/domain';
import { EffectiveDate } from '@ecomerece/domain/value-objects/effective-date.vo';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';

export type OrderRequestMessagesType = {
  message: string;
  updatedData?: OrderRequestReadModel;
};

export const OrderRequestMessages = {
  created(requestId: Id, actorId: Id, data: OrderRequestReadModel): OrderRequestMessagesType {
    return {
      message: `Order request ${requestId.value} was created by ${actorId.value} on ${EffectiveDate.today().value}.`,
      updatedData: data,
    };
  },

  accepted(requestId: Id, actorId: Id, data: OrderRequestReadModel): OrderRequestMessagesType {
    return {
      message: `Order request ${requestId.value} was accepted by ${actorId.value} on ${EffectiveDate.today().value}.`,
      updatedData: data,
    };
  },

  rejected(requestId: Id, actorId: Id, data: OrderRequestReadModel): OrderRequestMessagesType {
    return {
      message: `Order request ${requestId.value} was rejected by ${actorId.value} on ${EffectiveDate.today().value}.`,
      updatedData: data,
    };
  },

  cancelled(requestId: Id, actorId: Id, data: OrderRequestReadModel): OrderRequestMessagesType {
    return {
      message: `Order request ${requestId.value} was cancelled by ${actorId.value} on ${EffectiveDate.today().value}.`,
      updatedData: data,
    };
  },
};
