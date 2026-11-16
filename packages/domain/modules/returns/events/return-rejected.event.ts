import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id, type Reason } from '../../../value-objects';

export class ReturnRejectedEvent implements IEvent<{ returnId: Id; reason: Reason; actorId: Id }> {
  readonly type = 'return.rejected';
  readonly occurredOn = EffectiveDate.today();
  constructor(public readonly payload: { returnId: Id; reason: Reason; actorId: Id }) {}
}
