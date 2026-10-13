import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class HomePromoAddedEvent implements IEvent<{ homeId: Id; promoId: Id }> {
  readonly type = 'home.promo-added';
  readonly occurredOn = EffectiveDate.today();
  constructor(public readonly payload: { homeId: Id; promoId: Id }) {}
}
