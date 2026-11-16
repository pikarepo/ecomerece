import { describe, expect, it } from 'bun:test';
import { BadRequestError } from '../../errors/app-error';
import { Id, Reason } from '../../value-objects';
import { NotificationAggregate } from '../notifications/notifications.aggregate';
import { NotificationTypeVO } from '../notifications/value-objects/notification-type.vo';

const id = (n: number) => Id.create(`00000000-0000-7000-8000-${String(n).padStart(12, '0')}`);
const buyer = id(4);
const reason = () => Reason.create('dismissed by the recipient from their inbox');

function notification(
  overrides: Partial<Parameters<typeof NotificationAggregate.create>[0]> = {},
) {
  return NotificationAggregate.create({
    id: id(950),
    userId: buyer,
    type: NotificationTypeVO.create('shipment'),
    title: 'Shipment dispatched',
    body: 'Your parcel is on its way with tcs tracking TCS-123456789.',
    referenceId: id(700),
    ...overrides,
  });
}

describe('NotificationAggregate creation', () => {
  it('starts unread with the recipient and reference', () => {
    const aggregate = notification();

    expect(aggregate.isRead).toBe(false);
    expect(aggregate.readAt).toBeNull();
    expect(aggregate.userId.value).toBe(buyer.value);
    expect(aggregate.referenceId?.value).toBe(id(700).value);
    expect(aggregate.delete.isDeleted).toBe(false);
  });

  it('refuses blank or oversized copy', () => {
    expect(() => notification({ title: 'ab' })).toThrow(BadRequestError);
    expect(() => notification({ body: 'x'.repeat(501) })).toThrow(BadRequestError);
  });

  it('raises notification.created when the handler writes the row', () => {
    const aggregate = notification();

    aggregate.notify();

    const [event] = aggregate.pullEvents();
    expect(event?.type).toBe('notification.created');
    expect(event?.payload).toMatchObject({ notificationId: id(950), userId: buyer, type: 'shipment' });
  });
});

describe('NotificationAggregate read state', () => {
  it('marks read once and stamps readAt', () => {
    const aggregate = notification();

    aggregate.markRead();
    expect(aggregate.isRead).toBe(true);
    expect(aggregate.readAt).not.toBeNull();

    const events = aggregate.pullEvents();
    expect(events.map((event) => event.type)).toEqual(['notification.read']);

    // Opening the same notification again must not emit a second event.
    aggregate.markRead();
    expect(aggregate.pullEvents()).toHaveLength(0);
  });
});

describe('NotificationAggregate dismissal', () => {
  it('soft deletes for the recipient', () => {
    const aggregate = notification();

    aggregate.dismiss(reason());

    expect(aggregate.delete.isDeleted).toBe(true);
    expect(aggregate.delete.performedBy?.value).toBe(buyer.value);
    expect(aggregate.pullEvents().at(-1)?.type).toBe('notification.dismissed');
  });

  it('refuses a second dismissal and any command after it', () => {
    const aggregate = notification();
    aggregate.dismiss(reason());

    expect(() => aggregate.dismiss(reason())).toThrow(BadRequestError);
    expect(() => aggregate.markRead()).toThrow(BadRequestError);
  });

  it('checks ownership', () => {
    expect(notification().isOwnedBy(buyer)).toBe(true);
    expect(notification().isOwnedBy(id(6))).toBe(false);
  });
});
