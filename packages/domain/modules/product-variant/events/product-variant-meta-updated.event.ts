import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class ProductVariantMetaUpdatedEvent
  implements IEvent<{ variantId: Id; productId: Id; actorId: Id }>
{
  readonly type = 'product-variant.meta-updated';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { variantId: Id; productId: Id; actorId: Id }) {}
}
