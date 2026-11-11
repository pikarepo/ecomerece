import type { IEvent } from '../../../events/event-bus.interface';
import { type DeleteInfoVO, EffectiveDate, type Id } from '../../../value-objects';

export class OrderDeletedEvent
  implements IEvent<{ orderId: Id; actorId: Id; deletionInfo: DeleteInfoVO }>
{
  readonly type = 'order.deleted';
  readonly occurredOn = EffectiveDate.today();

  constructor(
    public readonly payload: { orderId: Id; actorId: Id; deletionInfo: DeleteInfoVO },
  ) {}
}
