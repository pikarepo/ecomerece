import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class CouponCreatedEvent implements IEvent<{ couponId: Id; code: string; actorId: Id }> {
  readonly type = 'coupon.created';
  readonly occurredOn = EffectiveDate.today();
  constructor(public readonly payload: { couponId: Id; code: string; actorId: Id }) {}
}
