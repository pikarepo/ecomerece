import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class HomeContainerUpdatedEvent implements IEvent<{ homeId: Id; containerId: Id }> {
  readonly type = 'home.container-updated';
  readonly occurredOn = EffectiveDate.today();
  constructor(public readonly payload: { homeId: Id; containerId: Id }) {}
}
