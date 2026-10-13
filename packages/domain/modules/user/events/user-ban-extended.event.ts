import type { IEvent } from '../../../events/event-bus.interface';
import { type BanInfoVO, EffectiveDate, type Id } from '../../../value-objects';

export class UserBanExtendedEvent implements IEvent<{ userId: Id; banInfo: BanInfoVO }> {
  readonly type = 'user.ban-extended';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { userId: Id; banInfo: BanInfoVO }) {}
}
