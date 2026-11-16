import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class NotificationCreatedEvent
  implements IEvent<{ notificationId: Id; userId: Id; type: string }>
{
  readonly type = 'notification.created';
  readonly occurredOn = EffectiveDate.today();
  constructor(public readonly payload: { notificationId: Id; userId: Id; type: string }) {}
}
