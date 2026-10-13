import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class ProductDisclaimerEnabledEvent implements IEvent<{ productId: Id; actorId: Id }> {
  readonly type = 'product.disclaimer-enabled';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { productId: Id; actorId: Id }) {}
}
