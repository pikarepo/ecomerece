import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class NotificationReadEvent implements IEvent<{ notificationId: Id; userId: Id }> {
  readonly type = 'notification.read';
  readonly occurredOn = EffectiveDate.today();
  constructor(public readonly payload: { notificationId: Id; userId: Id }) {}
}
