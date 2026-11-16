import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class CouponDeactivatedEvent implements IEvent<{ couponId: Id; actorId: Id }> {
  readonly type = 'coupon.deactivated';
  readonly occurredOn = EffectiveDate.today();
  constructor(public readonly payload: { couponId: Id; actorId: Id }) {}
}
