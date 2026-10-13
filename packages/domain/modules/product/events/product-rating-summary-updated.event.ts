import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id, type Quantity } from '../../../value-objects';

export class ProductRatingSummaryUpdatedEvent
  implements IEvent<{ productId: Id; averageRating: Quantity; totalReviews: Quantity }>
{
  readonly type = 'product.rating-summary-updated';
  readonly occurredOn = EffectiveDate.today();

  constructor(
    public readonly payload: {
      productId: Id;
      averageRating: Quantity;
      totalReviews: Quantity;
    },
  ) {}
}
