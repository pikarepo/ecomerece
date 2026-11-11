import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class ReviewUnblockedEvent implements IEvent<{ reviewId: Id; actorId: Id }> {
  readonly type = 'review.unblocked';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { reviewId: Id; actorId: Id }) {}
}
