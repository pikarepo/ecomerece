import type { AuthActor } from '@ecomerece/contracts';
import { type NotificationListItemReadModel, NotificationAggregate } from '@ecomerece/domain';
import type { IEventBus } from '@ecomerece/domain/events/event-bus.interface';
import { NotificationTypeVO } from '@ecomerece/domain/modules/notifications/value-objects/notification-type.vo';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import { Reason } from '@ecomerece/domain/value-objects/reason.vo';
import type { GetMyNotificationsQueryDto } from '@ecomerece/shared';
import { NotificationMapper } from '../infrastructure/notification.mapper';
import type { NotificationRepository } from '../infrastructure/notification.repository';
import { NotificationMessages } from '../presentation/notifications.messages';
import type { NotificationDispatcher } from './notification.dispatcher';
import type { NotificationsInternalService } from './notifications.internal.service';

export type NotificationListResult = {
  data: NotificationListItemReadModel[];
  meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
};

export type CreateNotificationInput = {
  userId: Id;
  type: string;
  title: string;
  body: string;
  referenceId: Id | null;
};

/** Dismissing is a user action, so the reason is fixed rather than asked for. */
const DISMISS_REASON = 'dismissed by the recipient from their inbox';

export class NotificationsApplicationService {
  constructor(
    private readonly notificationRepo: NotificationRepository,
    private readonly internalService: NotificationsInternalService,
    private readonly eventBus: IEventBus,
    private readonly dispatcher: NotificationDispatcher,
  ) {}

  /** Called by the event handlers; the recipient never creates their own rows. */
  async createNotification(input: CreateNotificationInput) {
    const notification = NotificationAggregate.create({
      id: Id.create(),
      userId: input.userId,
      type: NotificationTypeVO.create(input.type),
      title: input.title,
      body: input.body,
      referenceId: input.referenceId,
    });

    notification.notify();
    await this.notificationRepo.Create(notification);
    await this.eventBus.publish(notification.pullEvents());
    // The inbox row is committed, so extra channels run after it and never
    // gate the event handler on a provider being reachable.
    await this.dispatcher.deliver(notification);

    return NotificationMapper.aggregateToResponseReadModel(notification);
  }

  async getMyNotifications(
    page: GetMyNotificationsQueryDto,
    actor: AuthActor,
  ): Promise<NotificationListResult> {
    const result = await this.notificationRepo.FindPaginated({
      filter: {
        userId: actor._id,
        isRead: page.isRead,
        type: page.type,
        deleted: false,
      },
      cursor: page.cursor ? Id.create(page.cursor) : undefined,
      limit: Quantity.create(page.limit),
      direction: page.direction,
    });

    return {
      data: result.data.map(NotificationMapper.aggregateToListItemReadModel),
      meta: result.meta,
    };
  }

  async getUnreadCount(actor: AuthActor): Promise<{ unreadCount: number }> {
    const unreadCount = await this.notificationRepo.CountUnread(Id.create(actor._id));
    return { unreadCount };
  }

  async markNotificationRead(notificationId: Id, actor: AuthActor) {
    const notification = await this.internalService.loadOwnedOrThrow(
      notificationId,
      Id.create(actor._id),
    );

    notification.markRead();
    await this.notificationRepo.Save(notification);
    await this.eventBus.publish(notification.pullEvents());

    return NotificationMessages.updated(notification, 'read');
  }

  async markAllNotificationsRead(actor: AuthActor): Promise<{ updatedCount: number }> {
    const updatedCount = await this.notificationRepo.MarkAllRead(Id.create(actor._id));
    return { updatedCount };
  }

  async dismissNotification(notificationId: Id, actor: AuthActor) {
    const notification = await this.internalService.loadOwnedOrThrow(
      notificationId,
      Id.create(actor._id),
    );

    notification.dismiss(Reason.create(DISMISS_REASON));
    await this.notificationRepo.Save(notification);
    await this.eventBus.publish(notification.pullEvents());

    return NotificationMessages.dismissed(notification);
  }
}
