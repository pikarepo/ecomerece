import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class HomeContainerRemovedEvent implements IEvent<{ homeId: Id; containerId: Id }> {
  readonly type = 'home.container-removed';
  readonly occurredOn = EffectiveDate.today();
  constructor(public readonly payload: { homeId: Id; containerId: Id }) {}
}
