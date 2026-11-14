import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id, type Quantity } from '../../../value-objects';

export class CartItemAddedEvent
  implements IEvent<{ cartId: Id; buyerId: Id; cartItemId: Id; variantId: Id; quantity: Quantity }>
{
  readonly type = 'cart.item-added';
  readonly occurredOn = EffectiveDate.today();
  constructor(
    public readonly payload: {
      cartId: Id;
      buyerId: Id;
      cartItemId: Id;
      variantId: Id;
      quantity: Quantity;
    },
  ) {}
}
