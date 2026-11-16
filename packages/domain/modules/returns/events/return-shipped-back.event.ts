import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class ReturnShippedBackEvent implements IEvent<{ returnId: Id; actorId: Id }> {
  readonly type = 'return.shipped-back';
  readonly occurredOn = EffectiveDate.today();
  constructor(public readonly payload: { returnId: Id; actorId: Id }) {}
}
