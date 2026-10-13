import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class ProductVariantRecoveredEvent
  implements IEvent<{ variantId: Id; productId: Id; actorId: Id }>
{
  readonly type = 'product-variant.recovered';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { variantId: Id; productId: Id; actorId: Id }) {}
}
