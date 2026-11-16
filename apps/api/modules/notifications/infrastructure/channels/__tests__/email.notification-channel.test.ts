import { describe, expect, it } from 'bun:test';
import type { NotificationDelivery } from '@ecomerece/domain';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { EmailMessage } from '../email-transport';
import { EmailNotificationChannel } from '../email.notification-channel';

const id = (n: number) => Id.create(`00000000-0000-7000-8000-${String(n).padStart(12, '0')}`);

function delivery(email: string | null): NotificationDelivery {
  return {
    notificationId: id(1),
    userId: id(3),
    type: 'order',
    title: 'Order placed',
    body: 'Order was placed and is waiting for the vendor.',
    referenceId: id(2),
    recipient: { fullName: 'Ayesha Khan', email },
  };
}

class RecordingTransport {
  readonly sent: EmailMessage[] = [];

  async send(message: EmailMessage): Promise<void> {
    this.sent.push(message);
  }
}

describe('EmailNotificationChannel', () => {
  it('maps a notification onto an email from the configured sender', async () => {
    const transport = new RecordingTransport();
    const channel = new EmailNotificationChannel(transport, {
      from: 'shop@example.com',
      subjectPrefix: '[Shop]',
    });

    await channel.send(delivery('ayesha@example.com'));

    expect(transport.sent).toHaveLength(1);
    expect(transport.sent[0]?.from).toBe('shop@example.com');
    expect(transport.sent[0]?.to).toBe('ayesha@example.com');
    expect(transport.sent[0]?.subject).toBe('[Shop] Order placed');
    expect(transport.sent[0]?.text).toContain('Reference: 00000000-0000-7000-8000-000000000002');
  });

  it('falls back to the notification id when there is no reference', async () => {
    const transport = new RecordingTransport();
    const channel = new EmailNotificationChannel(transport, { from: 'shop@example.com' });

    await channel.send({ ...delivery('ayesha@example.com'), referenceId: null });

    expect(transport.sent[0]?.text).toContain(`Reference: ${id(1).value}`);
  });

  it('skips recipients without an email address', async () => {
    const transport = new RecordingTransport();
    const channel = new EmailNotificationChannel(transport, { from: 'shop@example.com' });

    await channel.send(delivery(null));

    expect(transport.sent).toHaveLength(0);
  });
});
