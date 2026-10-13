import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class ReviewLikedEvent implements IEvent<{ reviewId: Id }> {
  readonly type = 'review.liked';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { reviewId: Id }) {}
}
