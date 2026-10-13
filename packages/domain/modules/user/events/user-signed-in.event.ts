import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class UserSignedInEvent implements IEvent<{ userId: Id }> {
  readonly type = 'user.signed-in';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { userId: Id }) {}
}
