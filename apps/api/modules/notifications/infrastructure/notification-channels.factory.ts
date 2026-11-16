import type { INotificationChannel } from '@ecomerece/domain';
import type { NotificationsConfig } from '../notifications.config';
import { ConsoleEmailTransport } from './channels/console.email-transport';
import type { IEmailTransport } from './channels/email-transport';
import { HttpEmailTransport } from './channels/http.email-transport';
import { EmailNotificationChannel } from './channels/email.notification-channel';

function createEmailTransport(email: NotificationsConfig['email']): IEmailTransport {
  if (email.transport === 'http') {
    // loadNotificationsConfig guarantees the url exists for the http transport.
    return new HttpEmailTransport({ url: email.webhookUrl ?? '', token: email.webhookToken });
  }

  return new ConsoleEmailTransport();
}

export function createNotificationChannels(config: NotificationsConfig): INotificationChannel[] {
  return config.channels.map((channel) => {
    switch (channel) {
      case 'email':
        return new EmailNotificationChannel(createEmailTransport(config.email), {
          from: config.email.from,
        });
    }
  });
}
