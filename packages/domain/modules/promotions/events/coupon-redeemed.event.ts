import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class CouponRedeemedEvent
  implements IEvent<{ couponId: Id; buyerId: Id; orderId: Id; discountAmount: number }>
{
  readonly type = 'coupon.redeemed';
  readonly occurredOn = EffectiveDate.today();
  constructor(
    public readonly payload: {
      couponId: Id;
      buyerId: Id;
      orderId: Id;
      discountAmount: number;
    },
  ) {}
}
