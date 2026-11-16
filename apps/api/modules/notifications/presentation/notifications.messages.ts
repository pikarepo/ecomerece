import type { NotificationAggregate } from '@ecomerece/domain';
import { EffectiveDate } from '@ecomerece/domain/value-objects/effective-date.vo';
import type { NotificationResponseReadModel } from '@ecomerece/shared';
import { NotificationMapper } from '../infrastructure/notification.mapper';

export type NotificationMessagesType = {
  message: string;
  updatedData: NotificationResponseReadModel;
};

export const NotificationMessages = {
  updated(notification: NotificationAggregate, action: string): NotificationMessagesType {
    return {
      updatedData: NotificationMapper.aggregateToResponseReadModel(notification),
      message: `Notification ${notification.id.value} was marked ${action} on ${EffectiveDate.today().value}.`,
    };
  },
  dismissed(notification: NotificationAggregate): NotificationMessagesType {
    return {
      updatedData: NotificationMapper.aggregateToResponseReadModel(notification),
      message: `Notification ${notification.id.value} was dismissed on ${EffectiveDate.today().value}.`,
    };
  },
};
