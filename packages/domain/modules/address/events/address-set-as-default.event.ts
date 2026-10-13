import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class AddressSetAsDefaultEvent implements IEvent<{ addressId: Id; ownerId: Id }> {
  readonly type = 'address.set-as-default';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { addressId: Id; ownerId: Id }) {}
}
