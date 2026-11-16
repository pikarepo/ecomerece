import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id, type Reason } from '../../../value-objects';

export class CouponDeletedEvent implements IEvent<{ couponId: Id; reason: Reason; actorId: Id }> {
  readonly type = 'coupon.deleted';
  readonly occurredOn = EffectiveDate.today();
  constructor(public readonly payload: { couponId: Id; reason: Reason; actorId: Id }) {}
}
