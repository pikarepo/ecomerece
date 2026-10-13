import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id, type Name, type Title } from '../../../value-objects';

export class ProductDisclaimerUpdatedEvent
  implements IEvent<{ productId: Id; actorId: Id; name: Name; title: Title }>
{
  readonly type = 'product.disclaimer-updated';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { productId: Id; actorId: Id; name: Name; title: Title }) {}
}
