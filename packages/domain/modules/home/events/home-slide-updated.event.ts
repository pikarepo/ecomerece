import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class HomeSlideUpdatedEvent implements IEvent<{ homeId: Id; slideId: Id }> {
  readonly type = 'home.slide-updated';
  readonly occurredOn = EffectiveDate.today();
  constructor(public readonly payload: { homeId: Id; slideId: Id }) {}
}
