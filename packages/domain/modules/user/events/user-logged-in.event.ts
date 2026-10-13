import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class UserLoggedInEvent implements IEvent<{ userId: Id }> {
  readonly type = 'user.logged-in';
  readonly occurredOn = EffectiveDate.today();
  constructor(public readonly payload: { userId: Id }) {}
}
