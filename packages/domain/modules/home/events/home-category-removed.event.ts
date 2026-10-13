import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class HomeCategoryRemovedEvent implements IEvent<{ homeId: Id; categoryId: Id }> {
  readonly type = 'home.category-removed';
  readonly occurredOn = EffectiveDate.today();
  constructor(public readonly payload: { homeId: Id; categoryId: Id }) {}
}
