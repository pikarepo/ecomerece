import type { INotificationChannel, NotificationDelivery } from '@ecomerece/domain';
import type { IEmailTransport } from './email-transport';

export interface EmailChannelConfig {
  from: string;
  /** Prefixes the subject so recipients can filter notification mail. */
  subjectPrefix?: string;
}

const DEFAULT_SUBJECT_PREFIX = '[Ecomerece]';

export class EmailNotificationChannel implements INotificationChannel {
  readonly name = 'email';

  constructor(
    private readonly transport: IEmailTransport,
    private readonly config: EmailChannelConfig,
  ) {}

  async send(delivery: NotificationDelivery): Promise<void> {
    // No address on file is not a failure: the inbox row is the copy they get.
    if (!delivery.recipient.email) return;

    const reference = delivery.referenceId ?? delivery.notificationId;

    await this.transport.send({
      from: this.config.from,
      to: delivery.recipient.email,
      subject: `${this.config.subjectPrefix ?? DEFAULT_SUBJECT_PREFIX} ${delivery.title}`,
      text: `${delivery.body}\n\nReference: ${reference.value}`,
    });
  }
}
