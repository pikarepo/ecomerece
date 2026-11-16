export interface NotificationReadModel {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  /** The order, shipment or return this notification is about. */
  referenceId: string | null;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
}

export interface NotificationListItemReadModel {
  id: string;
  type: string;
  title: string;
  isRead: boolean;
  referenceId: string | null;
  createdAt: Date;
}

export interface UnreadCountReadModel {
  unreadCount: number;
}
