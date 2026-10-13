import type { IEvent } from '../../../events/event-bus.interface';
import { type DeleteInfoVO, EffectiveDate, type Id } from '../../../value-objects';

export class ProductVariantDeletedEvent
  implements IEvent<{ variantId: Id; productId: Id; actorId: Id; deletionInfo: DeleteInfoVO }>
{
  readonly type = 'product-variant.deleted';
  readonly occurredOn = EffectiveDate.today();

  constructor(
    public readonly payload: {
      variantId: Id;
      productId: Id;
      actorId: Id;
      deletionInfo: DeleteInfoVO;
    },
  ) {}
}
