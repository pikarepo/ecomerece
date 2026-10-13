import type { UserRoleVO } from '@ecomerece/domain';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';

export type UserMessagesType = { message: string };
export const UserMessages = {
  ban(id: Id, actor: Id, days: number): UserMessagesType {
    return {
      message: `User ${id.value} was banned for ${days} days by ${actor.value}.`,
    };
  },
  delete(id: Id, actor: Id): UserMessagesType {
    return { message: `User ${id.value} was deleted by ${actor.value}.` };
  },
  recover(id: Id, actor: Id): UserMessagesType {
    return { message: `User ${id.value} was recovered by ${actor.value}.` };
  },
  banLift(id: Id, actor: Id): UserMessagesType {
    return { message: `The ban on user ${id.value} was lifted by ${actor.value}.` };
  },
  blockLift(id: Id, actor: Id): UserMessagesType {
    return { message: `The block on user ${id.value} was lifted by ${actor.value}.` };
  },
  block(id: Id, actor: Id): UserMessagesType {
    return { message: `User ${id.value} was blocked by ${actor.value}.` };
  },
  signIn(id: Id): UserMessagesType {
    return { message: `User ${id.value} signed in successfully.` };
  },
  initialized(id: Id): UserMessagesType {
    return { message: `User ${id.value} was initialized successfully.` };
  },
  logIn(id: Id): UserMessagesType {
    return { message: `User ${id.value} logged in successfully.` };
  },
  extendBan(id: Id, actor: Id, days: number): UserMessagesType {
    return {
      message: `The ban on user ${id.value} was extended by ${days} days by ${actor.value}.`,
    };
  },
  shortBan(id: Id, actor: Id, days: number): UserMessagesType {
    return {
      message: `The ban on user ${id.value} was reduced by ${days} days by ${actor.value}.`,
    };
  },
  assignRole(id: Id, role: UserRoleVO, actor: Id): UserMessagesType {
    return {
      message: `User ${id.value} was assigned the role "${role.value}" by ${actor.value}.`,
    };
  },
};
