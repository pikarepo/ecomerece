import type { ReturnRequestAggregate } from '@ecomerece/domain';
import { EffectiveDate } from '@ecomerece/domain/value-objects/effective-date.vo';
import type { Reason } from '@ecomerece/domain/value-objects/reason.vo';
import type { ReturnResponseReadModel } from '@ecomerece/shared';
import { ReturnMapper } from '../infrastructure/return.mapper';

export type ReturnMessagesType = {
  message: string;
  updatedData: ReturnResponseReadModel;
};

export const ReturnMessages = {
  created(request: ReturnRequestAggregate): ReturnMessagesType {
    return {
      updatedData: ReturnMapper.aggregateToResponseReadModel(request),
      message: `Return ${request.id.value} was requested for order item ${request.orderItemId.value} (${request.quantity.value} unit(s), ${request.returnType.value}) on ${EffectiveDate.today().value}.`,
    };
  },
  updated(request: ReturnRequestAggregate, action: string): ReturnMessagesType {
    return {
      updatedData: ReturnMapper.aggregateToResponseReadModel(request),
      message: `Return ${request.id.value} is now ${action} (status: ${request.status.value}) on ${EffectiveDate.today().value}.`,
    };
  },
  deleted(request: ReturnRequestAggregate, reason: Reason): ReturnMessagesType {
    return {
      updatedData: ReturnMapper.aggregateToResponseReadModel(request),
      message: `Return ${request.id.value} was deleted on ${EffectiveDate.today().value}. Reason: ${reason.value}.`,
    };
  },
  recovered(request: ReturnRequestAggregate): ReturnMessagesType {
    return {
      updatedData: ReturnMapper.aggregateToResponseReadModel(request),
      message: `Return ${request.id.value} was recovered on ${EffectiveDate.today().value}.`,
    };
  },
};
