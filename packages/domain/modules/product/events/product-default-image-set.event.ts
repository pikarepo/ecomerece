import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id, type Quantity } from '../../../value-objects';

export class ProductDefaultImageSetEvent
  implements IEvent<{ productId: Id; actorId: Id; index: Quantity }>
{
  readonly type = 'product.default-image-set';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { productId: Id; actorId: Id; index: Quantity }) {}
}
