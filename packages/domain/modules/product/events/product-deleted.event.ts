import type { IEvent } from '../../../events/event-bus.interface';
import { type DeleteInfoVO, EffectiveDate, type Id } from '../../../value-objects';

export class ProductDeletedEvent
  implements IEvent<{ productId: Id; actorId: Id; deletionInfo: DeleteInfoVO }>
{
  readonly type = 'product.deleted';
  readonly occurredOn = EffectiveDate.today();

  constructor(
    public readonly payload: { productId: Id; actorId: Id; deletionInfo: DeleteInfoVO },
  ) {}
}
