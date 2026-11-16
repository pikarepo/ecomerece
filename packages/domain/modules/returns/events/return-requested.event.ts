import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class ReturnRequestedEvent
  implements IEvent<{ returnId: Id; orderId: Id; orderItemId: Id; buyerId: Id }>
{
  readonly type = 'return.requested';
  readonly occurredOn = EffectiveDate.today();
  constructor(
    public readonly payload: { returnId: Id; orderId: Id; orderItemId: Id; buyerId: Id },
  ) {}
}
