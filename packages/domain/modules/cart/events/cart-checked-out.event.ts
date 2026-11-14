import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

/**
 * Raised once per checkout, after the order module created the one order that
 * covers every selected line, whatever vendors it spans.
 */
export class CartCheckedOutEvent
  implements IEvent<{ cartId: Id; buyerId: Id; orderId: Id; cartItemIds: Id[] }>
{
  readonly type = 'cart.checked-out';
  readonly occurredOn = EffectiveDate.today();
  constructor(
    public readonly payload: { cartId: Id; buyerId: Id; orderId: Id; cartItemIds: Id[] },
  ) {}
}
