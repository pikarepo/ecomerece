import type { IEvent } from '../../../events/event-bus.interface';
import { type DeleteInfoVO, EffectiveDate, type Id } from '../../../value-objects';

export class ReviewDeletedEvent implements IEvent<{ reviewId: Id; deletionInfo: DeleteInfoVO }> {
  readonly type = 'review.deleted';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { reviewId: Id; deletionInfo: DeleteInfoVO }) {}
}
