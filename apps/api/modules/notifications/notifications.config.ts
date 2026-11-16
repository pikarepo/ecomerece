export type NotificationChannelName = 'email';
export type EmailTransportName = 'console' | 'http';

export interface NotificationsConfig {
  /** Extra delivery channels beyond the inbox; empty means in-app only. */
  channels: NotificationChannelName[];
  email: {
    transport: EmailTransportName;
    from: string;
    webhookUrl?: string;
    webhookToken?: string;
  };
}

const SUPPORTED_CHANNELS: NotificationChannelName[] = ['email'];

function parseChannels(raw: string | undefined): NotificationChannelName[] {
  if (!raw) return [];

  const requested = raw
    .split(',')
    .map((name) => name.trim().toLowerCase())
    .filter((name) => name.length > 0);

  const unknown = requested.filter(
    (name) => !SUPPORTED_CHANNELS.includes(name as NotificationChannelName),
  );
  if (unknown.length > 0) {
    // Fail at boot rather than silently dropping mail a deployment expects.
    throw new Error(
      `Unsupported NOTIFICATION_CHANNELS value(s): ${unknown.join(', ')}. Supported: ${SUPPORTED_CHANNELS.join(', ')}.`,
    );
  }

  return [...new Set(requested)] as NotificationChannelName[];
}

export function loadNotificationsConfig(): NotificationsConfig {
  const webhookUrl = process.env.NOTIFICATION_EMAIL_WEBHOOK_URL;
  const transport = (process.env.NOTIFICATION_EMAIL_TRANSPORT ??
    (webhookUrl ? 'http' : 'console')) as EmailTransportName;

  if (transport !== 'console' && transport !== 'http') {
    throw new Error(
      `Unsupported NOTIFICATION_EMAIL_TRANSPORT "${transport}". Use "console" or "http".`,
    );
  }
  if (transport === 'http' && !webhookUrl) {
    throw new Error(
      'NOTIFICATION_EMAIL_WEBHOOK_URL is required when NOTIFICATION_EMAIL_TRANSPORT=http.',
    );
  }

  return {
    channels: parseChannels(process.env.NOTIFICATION_CHANNELS),
    email: {
      transport,
      from: process.env.NOTIFICATION_EMAIL_FROM ?? 'no-reply@ecomerece.local',
      webhookUrl,
      webhookToken: process.env.NOTIFICATION_EMAIL_WEBHOOK_TOKEN,
    },
  };
}
