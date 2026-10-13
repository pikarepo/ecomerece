import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class HomeFeatureUpdatedEvent implements IEvent<{ homeId: Id; featureId: Id }> {
  readonly type = 'home.feature-updated';
  readonly occurredOn = EffectiveDate.today();
  constructor(public readonly payload: { homeId: Id; featureId: Id }) {}
}
