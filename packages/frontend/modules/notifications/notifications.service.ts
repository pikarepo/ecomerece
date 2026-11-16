// notifications.service.ts

import type {
  GetMyNotificationsQueryDto,
  NotificationListItemResponseReadModel,
  NotificationResponseReadModel,
} from '@ecomerece/shared';
import { http } from './../../lib';

export type NotificationMutationResult = {
  message: string;
  updatedData?: NotificationResponseReadModel;
};

export type PaginatedNotificationsResult = {
  data: NotificationListItemResponseReadModel[];
  meta: {
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
  };
};

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') searchParams.set(key, String(value));
  }

  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

export class NotificationsService {
  getMyNotifications(params: GetMyNotificationsQueryDto): Promise<PaginatedNotificationsResult> {
    return http.get<PaginatedNotificationsResult>(
      `/notification/my/all${buildQuery({
        type: params.type,
        isRead: params.isRead,
        cursor: params.cursor,
        limit: params.limit,
        direction: params.direction,
      })}`,
    );
  }

  getUnreadCount(): Promise<{ unreadCount: number }> {
    return http.get<{ unreadCount: number }>('/notification/my/unread-count');
  }

  markRead(id: string): Promise<NotificationMutationResult> {
    return http.patch<NotificationMutationResult>(`/notification/my/${id}/read`);
  }

  markAllRead(): Promise<{ updatedCount: number }> {
    return http.patch<{ updatedCount: number }>('/notification/my/read-all');
  }

  dismiss(id: string): Promise<NotificationMutationResult> {
    return http.delete<NotificationMutationResult>(`/notification/my/${id}`);
  }
}

export const notificationsService = new NotificationsService();
