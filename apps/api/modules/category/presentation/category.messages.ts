import { EffectiveDate, type Id } from '@ecomerece/domain';
import type { categoryResponseReadModels } from '@ecomerece/shared';

export type CategoryMessagesType = {
  updatedData?: categoryResponseReadModels;
  message: string;
};
export const CategoryMessags = {
  created(id: Id, actorId: Id): CategoryMessagesType {
    return {
      message: `Category ${id.value} was created by ${actorId.value} on ${EffectiveDate.today().value}.`,
    };
  },
  updated(id: Id, actorId: Id): CategoryMessagesType {
    return {
      message: `Category ${id.value} was updated by ${actorId.value} on ${EffectiveDate.today().value}.`,
    };
  },
  deleted(id: Id, actorId: Id): CategoryMessagesType {
    return {
      message: `Category ${id.value} was deleted by ${actorId.value} on ${EffectiveDate.today().value}.`,
    };
  },
};
