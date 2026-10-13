import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class ProductMadePublicEvent implements IEvent<{ productId: Id }> {
  readonly type = 'product.made-public';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { productId: Id }) {}
}
