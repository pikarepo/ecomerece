import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type DeleteInfoVO, type Id } from '../../../value-objects';

export class CartDeletedEvent
  implements IEvent<{ cartId: Id; buyerId: Id; actorId: Id; deletionInfo: DeleteInfoVO }>
{
  readonly type = 'cart.deleted';
  readonly occurredOn = EffectiveDate.today();
  constructor(
    public readonly payload: {
      cartId: Id;
      buyerId: Id;
      actorId: Id;
      deletionInfo: DeleteInfoVO;
    },
  ) {}
}
