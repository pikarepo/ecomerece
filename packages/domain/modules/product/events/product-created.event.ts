import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class ProductCreatedEvent
  implements IEvent<{ productId: Id; vendorId: Id; categoryId: Id }>
{
  readonly type = 'product.created';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { productId: Id; vendorId: Id; categoryId: Id }) {}
}
