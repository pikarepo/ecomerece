import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class ProductRecoveredEvent implements IEvent<{ productId: Id }> {
  readonly type = 'product.recovered';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { productId: Id }) {}
}
