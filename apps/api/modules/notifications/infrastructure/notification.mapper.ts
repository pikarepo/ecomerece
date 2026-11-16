import {
  NotificationAggregate,
  type NotificationListItemReadModel,
  type NotificationReadModel,
} from '@ecomerece/domain';
import { NotificationTypeVO } from '@ecomerece/domain/modules/notifications/value-objects/notification-type.vo';
import { DeleteInfoVO } from '@ecomerece/domain/value-objects/delete-info.vo';
import { EffectiveDate } from '@ecomerece/domain/value-objects/effective-date.vo';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import { Reason } from '@ecomerece/domain/value-objects/reason.vo';
import type {
  NotificationListItemResponseReadModel,
  NotificationResponseReadModel,
} from '@ecomerece/shared';
import type { NotificationPersistence } from './notification.model';

function toDate(value: Date | null): Date | null {
  return value ? new Date(value) : null;
}

export const NotificationMapper = {
  persistenceToAggregate(doc: NotificationPersistence): NotificationAggregate {
    return NotificationAggregate.rehydrate(
      Id.create(doc._id),
      Id.create(doc.userId),
      NotificationTypeVO.rehydrate(doc.type),
      doc.title,
      doc.body,
      doc.referenceId ? Id.create(doc.referenceId) : null,
      doc.isRead,
      doc.readAt ? EffectiveDate.rehydrate(doc.readAt) : null,
      DeleteInfoVO.rehydrate(
        doc.deleted.deletedBy ? Id.create(doc.deleted.deletedBy) : null,
        doc.deleted.deleted,
        doc.deleted.deletedFrom ? EffectiveDate.rehydrate(doc.deleted.deletedFrom) : null,
        doc.deleted.reason ? Reason.create(doc.deleted.reason) : null,
      ),
      Quantity.rehydrate(doc.version),
      EffectiveDate.rehydrate(doc.createdAt),
    );
  },

  aggregateToPersistence(notification: NotificationAggregate) {
    return {
      _id: notification.id.value,
      userId: notification.userId.value,
      type: notification.type.value,
      title: notification.title,
      body: notification.body,
      referenceId: notification.referenceId?.value ?? null,
      isRead: notification.isRead,
      readAt: notification.readAt?.value ?? null,
      version: notification.version.value,
      deleted: {
        deleted: notification.delete.deleted,
        deletedFrom: notification.delete.from?.value ?? null,
        deletedBy: notification.delete.performedBy?.value ?? null,
        reason: notification.delete.reason?.value ?? null,
      },
      createdAt: notification.createdAt.value,
      updatedAt: EffectiveDate.today().value,
    };
  },

  aggregateToReadModel(notification: NotificationAggregate): NotificationReadModel {
    return {
      id: notification.id.value,
      userId: notification.userId.value,
      type: notification.type.value,
      title: notification.title,
      body: notification.body,
      referenceId: notification.referenceId?.value ?? null,
      isRead: notification.isRead,
      readAt: notification.readAt?.value ?? null,
      createdAt: notification.createdAt.value,
    };
  },

  persistenceToReadModel(doc: NotificationPersistence): NotificationReadModel {
    return {
      id: doc._id,
      userId: doc.userId,
      type: doc.type,
      title: doc.title,
      body: doc.body,
      referenceId: doc.referenceId ?? null,
      isRead: doc.isRead,
      readAt: toDate(doc.readAt),
      createdAt: doc.createdAt,
    };
  },

  aggregateToResponseReadModel(notification: NotificationAggregate): NotificationResponseReadModel {
    return {
      id: notification.id.value,
      type: notification.type.value,
      title: notification.title,
      body: notification.body,
      referenceId: notification.referenceId?.value ?? null,
      isRead: notification.isRead,
      readAt: notification.readAt?.value ?? null,
      createdAt: notification.createdAt.value,
    };
  },

  aggregateToListItemReadModel(
    notification: NotificationAggregate,
  ): NotificationListItemResponseReadModel {
    return {
      id: notification.id.value,
      type: notification.type.value,
      title: notification.title,
      isRead: notification.isRead,
      referenceId: notification.referenceId?.value ?? null,
      createdAt: notification.createdAt.value,
    };
  },
};
