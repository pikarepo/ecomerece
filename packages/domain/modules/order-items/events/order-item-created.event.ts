import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id, type Money, type Quantity } from '../../../value-objects';

export class OrderItemCreatedEvent
  implements
    IEvent<{
      orderItemId: Id;
      orderId: Id;
      vendorId: Id;
      productId: Id;
      variantId: Id;
      quantity: Quantity;
      price: Money;
      totalPrice: Money;
    }>
{
  readonly type = 'order-item.created';
  readonly occurredOn = EffectiveDate.today();

  constructor(
    public readonly payload: {
      orderItemId: Id;
      orderId: Id;
      vendorId: Id;
      productId: Id;
      variantId: Id;
      quantity: Quantity;
      price: Money;
      totalPrice: Money;
    },
  ) {}
}
