import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id, type UrlVO } from '../../../value-objects';

export class CategoryImageUpdatedEvent implements IEvent<{ categoryId: Id; image: UrlVO }> {
  readonly type = 'category.image-updated';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { categoryId: Id; image: UrlVO }) {}
}
