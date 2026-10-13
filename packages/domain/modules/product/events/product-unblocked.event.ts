import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class ProductUnblockedEvent implements IEvent<{ productId: Id; actorId: Id }> {
  readonly type = 'product.unblocked';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { productId: Id; actorId: Id }) {}
}
