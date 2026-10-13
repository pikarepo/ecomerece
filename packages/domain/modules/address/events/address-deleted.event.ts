import type { IEvent } from '../../../events/event-bus.interface';
import { type DeleteInfoVO, EffectiveDate, type Id } from '../../../value-objects';

export class AddressDeletedEvent
  implements IEvent<{ addressId: Id; ownerId: Id; actorId: Id; deletionInfo: DeleteInfoVO }>
{
  readonly type = 'address.deleted';
  readonly occurredOn = EffectiveDate.today();

  constructor(
    public readonly payload: {
      addressId: Id;
      ownerId: Id;
      actorId: Id;
      deletionInfo: DeleteInfoVO;
    },
  ) {}
}
