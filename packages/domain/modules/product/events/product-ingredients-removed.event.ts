import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class ProductIngredientsRemovedEvent
  implements IEvent<{ productId: Id; actorId: Id; items: string[] }>
{
  readonly type = 'product.ingredients-removed';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { productId: Id; actorId: Id; items: string[] }) {}
}
