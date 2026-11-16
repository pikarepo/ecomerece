import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class CouponRecoveredEvent implements IEvent<{ couponId: Id; actorId: Id }> {
  readonly type = 'coupon.recovered';
  readonly occurredOn = EffectiveDate.today();
  constructor(public readonly payload: { couponId: Id; actorId: Id }) {}
}
