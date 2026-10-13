import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class ReviewUpdatedEvent implements IEvent<{ reviewId: Id; authorId: Id }> {
  readonly type = 'review.updated';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { reviewId: Id; authorId: Id }) {}
}
