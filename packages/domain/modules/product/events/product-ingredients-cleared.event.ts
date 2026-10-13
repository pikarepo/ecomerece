import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class ProductIngredientsClearedEvent implements IEvent<{ productId: Id; actorId: Id }> {
  readonly type = 'product.ingredients-cleared';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { productId: Id; actorId: Id }) {}
}
