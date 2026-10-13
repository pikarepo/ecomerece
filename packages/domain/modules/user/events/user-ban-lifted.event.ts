import type { IEvent } from '../../../events/event-bus.interface';
import { type BanInfoVO, EffectiveDate, type Id } from '../../../value-objects';

export class UserBanLiftedEvent implements IEvent<{ userId: Id; banInfo: BanInfoVO }> {
  readonly type = 'user.ban-lifted';
  readonly occurredOn = EffectiveDate.today();
  constructor(public readonly payload: { userId: Id; banInfo: BanInfoVO }) {}
}
