import { describe, expect, it, spyOn } from 'bun:test';
import type { IUserQueries } from '@ecomerece/contracts';
import {
  type INotificationChannel,
  type NotificationDelivery,
  NotificationAggregate,
} from '@ecomerece/domain';
import { NotificationTypeVO } from '@ecomerece/domain/modules/notifications/value-objects/notification-type.vo';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { NotificationDispatcher } from '../notification.dispatcher';

const id = (n: number) => Id.create(`00000000-0000-7000-8000-${String(n).padStart(12, '0')}`);
const userId = id(3);

function notification() {
  return NotificationAggregate.create({
    id: id(1),
    userId,
    type: NotificationTypeVO.create('order'),
    title: 'Order placed',
    body: 'Order was placed and is waiting for the vendor.',
    referenceId: id(2),
  });
}

function userQueries(email: string | null): IUserQueries {
  return {
    ensureActiveById: async () => ({
      user: {
        id: userId.value,
        fullName: 'Ayesha Khan',
        email,
        image: null,
        role: 'customer',
        isBlocked: false,
        isBanned: false,
        bannedUntil: null,
        isDeleted: false,
        lastLogin: null,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      },
      active: true,
    }),
    ensureActive: async () => true,
  };
}

class RecordingChannel implements INotificationChannel {
  readonly received: NotificationDelivery[] = [];

  constructor(readonly name: string) {}

  async send(delivery: NotificationDelivery): Promise<void> {
    this.received.push(delivery);
  }
}

class FailingChannel implements INotificationChannel {
  readonly name = 'failing';

  async send(): Promise<void> {
    throw new Error('provider is down');
  }
}

describe('NotificationDispatcher', () => {
  it('sends to every enabled channel with the recipient contact', async () => {
    const email = new RecordingChannel('email');
    const webhook = new RecordingChannel('webhook');
    const dispatcher = new NotificationDispatcher(
      [email, webhook],
      userQueries('ayesha@example.com'),
    );

    await dispatcher.deliver(notification());

    for (const channel of [email, webhook]) {
      expect(channel.received).toHaveLength(1);
      expect(channel.received[0]?.recipient).toEqual({
        fullName: 'Ayesha Khan',
        email: 'ayesha@example.com',
      });
      expect(channel.received[0]?.title).toBe('Order placed');
      expect(channel.received[0]?.referenceId?.equals(id(2))).toBe(true);
    }
  });

  it('keeps delivering after a channel fails, and logs the failure', async () => {
    const log = spyOn(console, 'error').mockImplementation(() => {});
    const healthy = new RecordingChannel('email');
    const dispatcher = new NotificationDispatcher(
      [new FailingChannel(), healthy],
      userQueries(null),
    );

    await dispatcher.deliver(notification());

    expect(healthy.received).toHaveLength(1);
    expect(log).toHaveBeenCalledWith(
      '[notifications] channel "failing" failed',
      expect.objectContaining({ notificationId: id(1).value }),
    );
    log.mockRestore();
  });

  it('does nothing when no channel is enabled', async () => {
    let lookups = 0;
    const queries: IUserQueries = {
      ensureActiveById: async () => {
        lookups += 1;
        return { user: null, active: false };
      },
      ensureActive: async () => false,
    };

    await new NotificationDispatcher([], queries).deliver(notification());

    expect(lookups).toBe(0);
  });

  it('still delivers with a null address when the recipient is unknown', async () => {
    const channel = new RecordingChannel('webhook');
    const queries: IUserQueries = {
      ensureActiveById: async () => ({ user: null, active: false }),
      ensureActive: async () => false,
    };

    await new NotificationDispatcher([channel], queries).deliver(notification());

    expect(channel.received[0]?.recipient.email).toBeNull();
  });

  it('continues when the recipient lookup itself throws', async () => {
    const log = spyOn(console, 'error').mockImplementation(() => {});
    const channel = new RecordingChannel('webhook');
    const queries: IUserQueries = {
      ensureActiveById: async () => {
        throw new Error('user store unreachable');
      },
      ensureActive: async () => false,
    };

    await new NotificationDispatcher([channel], queries).deliver(notification());

    expect(channel.received).toHaveLength(1);
    expect(log).toHaveBeenCalledWith(
      '[notifications] recipient lookup failed',
      expect.objectContaining({ userId: userId.value }),
    );
    log.mockRestore();
  });
});
