import type { IEvent } from '../../../events/event-bus.interface';
import { type BlockInfoVO, EffectiveDate, type Id } from '../../../value-objects';

export class UserBlockedEvent implements IEvent<{ userId: Id; blockInfo: BlockInfoVO }> {
  readonly type = 'user.blocked';
  readonly occurredOn = EffectiveDate.today();
  constructor(public readonly payload: { userId: Id; blockInfo: BlockInfoVO }) {}
}
