import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';
import type { ProductDisclaimerItem } from './product-disclaimers-added.event';

export class ProductDisclaimersRemovedEvent
  implements IEvent<{ productId: Id; actorId: Id; items: ProductDisclaimerItem[] }>
{
  readonly type = 'product.disclaimers-removed';
  readonly occurredOn = EffectiveDate.today();

  constructor(
    public readonly payload: {
      productId: Id;
      actorId: Id;
      items: ProductDisclaimerItem[];
    },
  ) {}
}
