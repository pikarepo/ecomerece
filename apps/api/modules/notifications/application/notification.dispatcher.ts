import type { IUserQueries } from '@ecomerece/contracts';
import type {
  INotificationChannel,
  NotificationAggregate,
  NotificationDelivery,
} from '@ecomerece/domain';

/**
 * Fans one inbox notification out to every enabled channel. The inbox row is
 * already saved by the application service, so a provider outage is logged with
 * the ids needed to replay it by hand instead of failing the business flow that
 * raised the event.
 */
export class NotificationDispatcher {
  constructor(
    private readonly channels: INotificationChannel[],
    private readonly userQueries: IUserQueries,
  ) {}

  async deliver(notification: NotificationAggregate): Promise<void> {
    if (this.channels.length === 0) return;

    const delivery: NotificationDelivery = {
      notificationId: notification.id,
      userId: notification.userId,
      type: notification.type.value,
      title: notification.title,
      body: notification.body,
      referenceId: notification.referenceId,
      recipient: await this.resolveRecipient(notification),
    };

    for (const channel of this.channels) {
      try {
        await channel.send(delivery);
      } catch (error) {
        console.error(`[notifications] channel "${channel.name}" failed`, {
          notificationId: delivery.notificationId.value,
          userId: delivery.userId.value,
          error: error instanceof Error ? error.message : error,
        });
      }
    }
  }

  private async resolveRecipient(
    notification: NotificationAggregate,
  ): Promise<NotificationDelivery['recipient']> {
    try {
      const { user } = await this.userQueries.ensureActiveById(notification.userId);
      return { fullName: user?.fullName ?? 'customer', email: user?.email ?? null };
    } catch (error) {
      // A failed lookup must not block channels that do not need contact details.
      console.error('[notifications] recipient lookup failed', {
        userId: notification.userId.value,
        error: error instanceof Error ? error.message : error,
      });
      return { fullName: 'customer', email: null };
    }
  }
}
