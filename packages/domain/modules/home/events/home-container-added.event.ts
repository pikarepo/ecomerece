import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class HomeContainerAddedEvent implements IEvent<{ homeId: Id; containerId: Id }> {
  readonly type = 'home.container-added';
  readonly occurredOn = EffectiveDate.today();
  constructor(public readonly payload: { homeId: Id; containerId: Id }) {}
}
