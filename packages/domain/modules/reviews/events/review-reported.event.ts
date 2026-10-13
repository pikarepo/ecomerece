import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id, type Reason } from '../../../value-objects';

export class ReviewReportedEvent implements IEvent<{ reviewId: Id; reason: Reason }> {
  readonly type = 'review.reported';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { reviewId: Id; reason: Reason }) {}
}
