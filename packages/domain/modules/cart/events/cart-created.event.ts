import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class CartCreatedEvent implements IEvent<{ cartId: Id; buyerId: Id }> {
  readonly type = 'cart.created';
  readonly occurredOn = EffectiveDate.today();
  constructor(public readonly payload: { cartId: Id; buyerId: Id }) {}
}
