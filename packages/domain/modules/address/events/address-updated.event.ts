import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class AddressUpdatedEvent implements IEvent<{ addressId: Id; ownerId: Id; actorId: Id }> {
  readonly type = 'address.updated';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { addressId: Id; ownerId: Id; actorId: Id }) {}
}
