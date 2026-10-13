import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id, type Name, type Title } from '../../../value-objects';

export interface ProductDisclaimerItem {
  name: Name;
  title: Title;
}

export class ProductDisclaimersAddedEvent
  implements IEvent<{ productId: Id; actorId: Id; items: ProductDisclaimerItem[] }>
{
  readonly type = 'product.disclaimers-added';
  readonly occurredOn = EffectiveDate.today();

  constructor(
    public readonly payload: {
      productId: Id;
      actorId: Id;
      items: ProductDisclaimerItem[];
    },
  ) {}
}
