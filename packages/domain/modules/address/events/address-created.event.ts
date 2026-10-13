import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class AddressCreatedEvent implements IEvent<{ addressId: Id; ownerId: Id }> {
  readonly type = 'address.created';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { addressId: Id; ownerId: Id }) {}
}
