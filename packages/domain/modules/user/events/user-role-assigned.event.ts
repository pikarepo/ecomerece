import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';
import type { RoleInfoVO } from '../value-objects/role-info.vo';

export class UserRoleAssignedEvent implements IEvent<{ userId: Id; roleInfo: RoleInfoVO }> {
  readonly type = 'user.role-assigned';
  readonly occurredOn = EffectiveDate.today();
  constructor(public readonly payload: { userId: Id; roleInfo: RoleInfoVO }) {}
}
