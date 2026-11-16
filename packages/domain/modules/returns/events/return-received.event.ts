import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

/** The goods are back with the vendor; the refund is a separate money step. */
export class ReturnReceivedEvent
  implements IEvent<{ returnId: Id; orderId: Id; orderItemId: Id; actorId: Id }>
{
  readonly type = 'return.received';
  readonly occurredOn = EffectiveDate.today();
  constructor(
    public readonly payload: { returnId: Id; orderId: Id; orderItemId: Id; actorId: Id },
  ) {}
}
