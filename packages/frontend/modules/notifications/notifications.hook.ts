// notifications.hook.ts

import { getMyNotificationsQuerySchema, type GetMyNotificationsQueryDto } from '@ecomerece/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from './notifications.service';

export const NOTIFICATIONS_QUERY_KEY = ['notifications'];

function invalidateNotifications(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
}

export function useGetMyNotifications(params: GetMyNotificationsQueryDto) {
  return useQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, 'my', params],
    queryFn: () =>
      notificationsService.getMyNotifications(getMyNotificationsQuerySchema.parse(params)),
  });
}

export function useGetUnreadNotificationCount() {
  return useQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, 'unread-count'],
    queryFn: () => notificationsService.getUnreadCount(),
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: () => invalidateNotifications(queryClient),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => invalidateNotifications(queryClient),
  });
}

export function useDismissNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsService.dismiss(id),
    onSuccess: () => invalidateNotifications(queryClient),
  });
}
