import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id, type UrlVO } from '../../../value-objects';

export class ProductImagesRemovedEvent
  implements IEvent<{ productId: Id; actorId: Id; urls: UrlVO | UrlVO[] }>
{
  readonly type = 'product.images-removed';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { productId: Id; actorId: Id; urls: UrlVO | UrlVO[] }) {}
}
