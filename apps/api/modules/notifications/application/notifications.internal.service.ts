import type { NotificationAggregate } from '@ecomerece/domain';
import type { Id } from '@ecomerece/domain/value-objects';
import { NotFoundError } from '../../../errors/app-error';
import type { NotificationRepository } from '../infrastructure/notification.repository';

export class NotificationsInternalService {
  constructor(private readonly notificationRepo: NotificationRepository) {}

  /**
   * Missing and foreign notifications answer the same way, so a caller cannot
   * probe other people's inboxes by id.
   */
  async loadOwnedOrThrow(notificationId: Id, userId: Id): Promise<NotificationAggregate> {
    const notification = await this.notificationRepo.FindById(notificationId);

    if (!notification || notification.delete.isDeleted || !notification.isOwnedBy(userId)) {
      throw new NotFoundError('Notification not found.');
    }

    return notification;
  }
}
