import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id, type ImageVO } from '../../../value-objects';

export class ProductImagesAddedEvent
  implements IEvent<{ productId: Id; actorId: Id; images: ImageVO | ImageVO[] }>
{
  readonly type = 'product.images-added';
  readonly occurredOn = EffectiveDate.today();

  constructor(
    public readonly payload: { productId: Id; actorId: Id; images: ImageVO | ImageVO[] },
  ) {}
}
