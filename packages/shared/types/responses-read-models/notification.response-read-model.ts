export interface NotificationResponseReadModel {
  id: string;
  type: string;
  title: string;
  body: string;
  referenceId: string | null;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
}

export interface NotificationListItemResponseReadModel {
  id: string;
  type: string;
  title: string;
  isRead: boolean;
  referenceId: string | null;
  createdAt: Date;
}
