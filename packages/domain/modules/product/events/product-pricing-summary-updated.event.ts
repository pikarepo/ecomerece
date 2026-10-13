import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id, type Money } from '../../../value-objects';

export class ProductPricingSummaryUpdatedEvent
  implements
    IEvent<{
      productId: Id;
      vendorId: Id;
      minPrice: Money;
      maxPrice: Money;
      minDiscountedPrice: Money;
      maxDiscountedPrice: Money;
    }>
{
  readonly type = 'product.pricing-summary-updated';
  readonly occurredOn = EffectiveDate.today();

  constructor(
    public readonly payload: {
      productId: Id;
      vendorId: Id;
      minPrice: Money;
      maxPrice: Money;
      minDiscountedPrice: Money;
      maxDiscountedPrice: Money;
    },
  ) {}
}
