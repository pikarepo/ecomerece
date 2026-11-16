import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id, type Reason } from '../../../value-objects';

export class NotificationDismissedEvent
  implements IEvent<{ notificationId: Id; userId: Id; reason: Reason }>
{
  readonly type = 'notification.dismissed';
  readonly occurredOn = EffectiveDate.today();
  constructor(public readonly payload: { notificationId: Id; userId: Id; reason: Reason }) {}
}
