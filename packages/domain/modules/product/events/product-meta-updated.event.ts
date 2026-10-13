import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class ProductMetaUpdatedEvent implements IEvent<{ productId: Id; actorId: Id }> {
  readonly type = 'product.meta-updated';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { productId: Id; actorId: Id }) {}
}
