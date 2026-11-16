import type { Id, Quantity } from '../../../value-objects';
import type { NotificationAggregate } from '../notifications.aggregate';

export interface NotificationPaginationFilter {
  userId?: string;
  type?: string;
  isRead?: boolean;
  deleted?: boolean;
}

export interface NotificationPage {
  data: NotificationAggregate[];
  meta: {
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
  };
}

export interface INotificationRepository {
  FindById(id: Id): Promise<NotificationAggregate | null>;
  FindPaginated(params: {
    filter?: NotificationPaginationFilter;
    cursor?: Id;
    limit?: Quantity;
    direction?: 'next' | 'prev';
  }): Promise<NotificationPage>;
  Create(notification: NotificationAggregate): Promise<void>;
  Save(notification: NotificationAggregate): Promise<void>;
  Delete(id: Id): Promise<void>;
  Exists(id: Id): Promise<boolean>;
  CountUnread(userId: Id): Promise<number>;
  /** Marks every unread row of one recipient as read and returns how many moved. */
  MarkAllRead(userId: Id): Promise<number>;
}
