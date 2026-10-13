import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class HomeCategoryUpdatedEvent implements IEvent<{ homeId: Id; categoryId: Id }> {
  readonly type = 'home.category-updated';
  readonly occurredOn = EffectiveDate.today();
  constructor(public readonly payload: { homeId: Id; categoryId: Id }) {}
}
