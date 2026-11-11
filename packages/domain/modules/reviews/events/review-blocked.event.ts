import type { IEvent } from '../../../events/event-bus.interface';
import { type BlockInfoVO, EffectiveDate, type Id } from '../../../value-objects';

export class ReviewBlockedEvent
  implements IEvent<{ reviewId: Id; actorId: Id; blockInfo: BlockInfoVO }>
{
  readonly type = 'review.blocked';
  readonly occurredOn = EffectiveDate.today();

  constructor(
    public readonly payload: { reviewId: Id; actorId: Id; blockInfo: BlockInfoVO },
  ) {}
}
