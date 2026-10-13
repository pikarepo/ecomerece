import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class CategoryMetaUpdatedEvent implements IEvent<{ categoryId: Id; actorId: Id }> {
  readonly type = 'category.meta-updated';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { categoryId: Id; actorId: Id }) {}
}
