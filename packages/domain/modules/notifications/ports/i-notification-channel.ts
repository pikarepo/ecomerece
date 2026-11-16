import type { Id } from '../../../value-objects';

/** Contact details an out-of-app channel needs to reach the recipient. */
export interface NotificationRecipient {
  fullName: string;
  /** Null when the account has no address on file; email channels then skip. */
  email: string | null;
}

/** One notification, reduced to what a delivery channel needs. */
export interface NotificationDelivery {
  notificationId: Id;
  userId: Id;
  type: string;
  title: string;
  body: string;
  referenceId: Id | null;
  recipient: NotificationRecipient;
}

/**
 * An extra delivery surface (email, SMS, push, chat) alongside the inbox. The
 * inbox row is always persisted; channels are opt-in adapters a deployment turns
 * on through `NOTIFICATION_CHANNELS`, so swapping or adding one never touches
 * the aggregate or the event handlers.
 */
export interface INotificationChannel {
  readonly name: string;
  send(delivery: NotificationDelivery): Promise<void>;
}
