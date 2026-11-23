import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { OrderItemsModel } from '../../../order-items/infrastructure/order-item.model';
import { NotificationModel } from '../../infrastructure/notification.model';
import {
  integrationEnabled,
  type ApiData,
  type ApiIntegrationHarness,
} from '../../../../testing/api-integration-harness';
import {
  createSecurityKit,
  expectRejected,
  expectUnauthorized,
  type AttackResult,
  type SecurityKit,
} from '../../../../testing/security-kit';

let kit: SecurityKit;
let harness: ApiIntegrationHarness;

type InboxItem = { id: string; isRead: boolean; type: string; title: string };

async function seedNotification() {
  const context = await harness.seedOrder({ available: 10, quantity: 2 });
  const doc = await NotificationModel.findOne({
    userId: harness.userIds.buyer,
    referenceId: context.orderId,
  }).lean();
  if (!doc) throw new Error('Order notification was not created.');
  return { ...context, notificationId: harness.track(doc._id) };
}

/** A second inbox row needs a second order, not a second catalog: one vendor per user. */
async function addNotification(catalog: { addressId: string; variantId: string }) {
  const data = harness.expectSuccess<ApiData>(
    await harness.requestAs('buyer', '/order/my', {
      method: 'POST',
      body: {
        idempotentKey: Id.create().value,
        addressId: catalog.addressId,
        safeOrder: true,
        waitingTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        items: [{ variantId: catalog.variantId, quantity: 1 }],
      },
    }),
  );
  const orderId = harness.track(harness.idFromData(data));
  harness.trackCleanup(() => OrderItemsModel.deleteMany({ orderId }));
  const doc = await NotificationModel.findOne({
    userId: harness.userIds.buyer,
    referenceId: orderId,
  }).lean();
  if (!doc) throw new Error('Order notification was not created.');
  return harness.track(doc._id);
}

function errorCode(result: AttackResult): string {
  const body = result.body as { error?: { code?: string } } | null;
  return body?.error?.code ?? 'unknown';
}

function inboxItems(result: AttackResult): InboxItem[] {
  const body = result.body as { data?: { data?: InboxItem[] } } | null;
  return body?.data?.data ?? [];
}

function unreadCount(result: AttackResult): number {
  const body = result.body as { data?: { unreadCount?: number } } | null;
  return body?.data?.unreadCount ?? -1;
}

async function otherUnreadIds(): Promise<string[]> {
  const docs = await NotificationModel.find({
    userId: { $ne: harness.userIds.buyer },
    isRead: false,
    'deleted.deleted': false,
  })
    .select('_id')
    .lean();
  return docs.map((doc) => String(doc._id)).sort();
}

describe.skipIf(!integrationEnabled)('notifications API database integration', () => {
  beforeAll(async () => {
    kit = await createSecurityKit({ dispatchEvents: true });
    harness = kit.harness;
  }, 30_000);

  beforeEach(() => {
    harness.events.length = 0;
  });

  afterEach(async () => {
    await harness.cleanup();
  });

  afterAll(async () => {
    if (kit) await kit.dispose();
  });

  it('creates a buyer notification when an order event is dispatched', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });

    const notification = await NotificationModel.findOne({
      userId: harness.userIds.buyer,
      referenceId: context.orderId,
    }).lean();
    if (!notification) throw new Error('Order notification was not created.');
    harness.track(notification._id);
    expect(notification.type).toBe('order');
    expect(notification.title).toBe('Order placed');
    expect(notification.isRead).toBe(false);
    expect(notification.deleted.deleted).toBe(false);
    expect(harness.events).toContain('notification.created');
  }, 30_000);

  it('marks a notification as read in the database', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    const notification = await NotificationModel.findOne({
      userId: harness.userIds.buyer,
      referenceId: context.orderId,
    }).lean();
    if (!notification) throw new Error('Order notification was not created.');
    const notificationId = harness.track(notification._id);
    harness.events.length = 0;

    harness.expectSuccess(
      await harness.requestAs('buyer', `/notification/my/${notificationId}/read`, {
        method: 'PATCH',
      }),
    );

    const updated = await NotificationModel.findById(notificationId).lean();
    expect(updated?.isRead).toBe(true);
    expect(updated?.readAt).not.toBeNull();
    expect(harness.events).toContain('notification.read');
  }, 30_000);

  it('NOT-01 keeps another buyer out of the inbox by id, count and list', async () => {
    const { notificationId } = await seedNotification();
    const read = await kit.send('buyerAlt', `/notification/my/${notificationId}/read`, {
      method: 'PATCH',
    });
    const dismiss = await kit.send('buyerAlt', `/notification/my/${notificationId}`, {
      method: 'DELETE',
    });
    const list = await kit.send('buyerAlt', '/notification/my/all');
    const count = await kit.send('buyerAlt', '/notification/my/unread-count');
    const doc = await NotificationModel.findById(notificationId).lean();

    kit.evidence('NOT-01', {
      readStatus: read.status,
      dismissStatus: dismiss.status,
      altItems: inboxItems(list).length,
      altUnread: unreadCount(count),
      victimIsRead: doc?.isRead,
      victimDeleted: doc?.deleted.deleted,
    });
    expectRejected(read, 'cross-tenant mark read');
    expectRejected(dismiss, 'cross-tenant dismiss');
    expect(inboxItems(list)).toHaveLength(0);
    expect(unreadCount(count)).toBe(0);
    expect(doc?.isRead).toBe(false);
    expect(doc?.deleted.deleted).toBe(false);
    expect(read.text).not.toContain('Order placed');
  }, 30_000);

  it('NOT-02 offers no client-facing way to write inbox rows', async () => {
    const { notificationId } = await seedNotification();
    const before = await NotificationModel.countDocuments({ userId: harness.userIds.buyer });
    const attempts = [
      await kit.send('buyer', '/notification/my/all', {
        method: 'POST',
        body: { type: 'system', title: 'Forged notice', body: 'Attacker authored body.' },
      }),
      await kit.send('admin', '/notification/admin', {
        method: 'POST',
        body: { userId: harness.userIds.buyer, type: 'system', title: 'Forged', body: 'Forged.' },
      }),
      await kit.send('buyer', `/notification/my/${notificationId}`, {
        method: 'PATCH',
        body: { title: 'Rewritten title', body: 'Rewritten body.' },
      }),
      await kit.sendAnonymously('/notification/my/all'),
    ];
    const after = await NotificationModel.countDocuments({ userId: harness.userIds.buyer });
    const doc = await NotificationModel.findById(notificationId).lean();

    kit.evidence('NOT-02', {
      statuses: kit.statuses(attempts).join(','),
      before,
      after,
      title: doc?.title,
    });
    for (const attempt of attempts) expectRejected(attempt, 'inbox write attempt');
    expect(after).toBe(before);
    expect(doc?.title).toBe('Order placed');
  }, 30_000);

  // NOT-03: z.coerce.boolean() turns the string "false" into true, so the unread
  // filter serves read rows. Kept failing until the query DTO parses booleans.
  it.failing('NOT-03 honours isRead=false as an unread-only filter', async () => {
    const first = await seedNotification();
    await addNotification(first);
    await kit.send('buyer', `/notification/my/${first.notificationId}/read`, { method: 'PATCH' });

    const unread = await kit.send('buyer', '/notification/my/all?isRead=false');
    const items = inboxItems(unread);
    const readOnes = items.filter((item) => item.isRead);

    kit.evidence('NOT-03', {
      status: unread.status,
      returned: items.length,
      readRowsReturned: readOnes.length,
      ids: items.map((item) => item.id).join(','),
    });
    expect(unread.accepted).toBe(true);
    expect(items.length).toBeGreaterThan(0);
    expect(readOnes).toHaveLength(0);
  }, 30_000);

  it('NOT-04 scopes mark-all-read to the caller only', async () => {
    const first = await seedNotification();
    const second = await addNotification(first);
    await kit.send('buyer', `/notification/my/${first.notificationId}/read`, { method: 'PATCH' });
    const othersBefore = await otherUnreadIds();

    const bulk = await kit.send('buyer', '/notification/my/read-all', { method: 'PATCH' });
    const othersAfter = await otherUnreadIds();
    const firstDoc = await NotificationModel.findById(first.notificationId).lean();
    const secondDoc = await NotificationModel.findById(second).lean();
    const count = await kit.send('buyer', '/notification/my/unread-count');

    kit.evidence('NOT-04', {
      status: bulk.status,
      updatedCount: (bulk.body as { data?: { updatedCount?: number } }).data?.updatedCount,
      otherUnreadBefore: othersBefore.length,
      otherUnreadAfter: othersAfter.length,
      buyerUnread: unreadCount(count),
    });
    expect(bulk.accepted).toBe(true);
    expect((bulk.body as { data?: { updatedCount?: number } }).data?.updatedCount).toBe(1);
    expect(othersAfter).toEqual(othersBefore);
    expect(firstDoc?.isRead).toBe(true);
    expect(secondDoc?.isRead).toBe(true);
    expect(unreadCount(count)).toBe(0);
  }, 30_000);

  it('NOT-05 dismisses once and refuses every later touch', async () => {
    const { notificationId } = await seedNotification();
    const dismiss = await kit.send('buyer', `/notification/my/${notificationId}`, {
      method: 'DELETE',
    });
    const again = await kit.send('buyer', `/notification/my/${notificationId}`, {
      method: 'DELETE',
    });
    const read = await kit.send('buyer', `/notification/my/${notificationId}/read`, {
      method: 'PATCH',
    });
    const list = await kit.send('buyer', '/notification/my/all');
    const count = await kit.send('buyer', '/notification/my/unread-count');
    const doc = await NotificationModel.findById(notificationId).lean();

    kit.evidence('NOT-05', {
      dismissStatus: dismiss.status,
      againStatus: again.status,
      readStatus: read.status,
      inList: inboxItems(list).some((item) => item.id === notificationId),
      unread: unreadCount(count),
      deletedBy: doc?.deleted.deletedBy,
      reason: doc?.deleted.reason,
    });
    expect(dismiss.accepted).toBe(true);
    expectRejected(again, 'second dismiss');
    expectRejected(read, 'read after dismiss');
    expect(inboxItems(list).some((item) => item.id === notificationId)).toBe(false);
    expect(unreadCount(count)).toBe(0);
    expect(doc?.deleted.deleted).toBe(true);
    expect(doc?.deleted.deletedBy).toBe(harness.userIds.buyer);
  }, 30_000);

  it('NOT-06 counts only live unread rows', async () => {
    const read = await seedNotification();
    const dismissed = await addNotification(read);
    const live = await addNotification(read);
    await kit.send('buyer', `/notification/my/${read.notificationId}/read`, { method: 'PATCH' });
    await kit.send('buyer', `/notification/my/${dismissed}`, { method: 'DELETE' });

    const count = await kit.send('buyer', '/notification/my/unread-count');
    const list = await kit.send('buyer', '/notification/my/all');

    kit.evidence('NOT-06', {
      unread: unreadCount(count),
      listed: inboxItems(list).length,
      liveId: live,
    });
    expect(unreadCount(count)).toBe(1);
    expect(inboxItems(list).map((item) => item.id)).toEqual([live, read.notificationId]);
    expect(inboxItems(list).map((item) => item.id)).not.toContain(dismissed);
  }, 30_000);

  it('NOT-07 rejects abusive paging and filter parameters', async () => {
    await seedNotification();
    const attempts = [
      await kit.send('buyer', '/notification/my/all?limit=0'),
      await kit.send('buyer', '/notification/my/all?limit=101'),
      await kit.send('buyer', '/notification/my/all?limit=1e9'),
      await kit.send('buyer', '/notification/my/all?type=bogus'),
      await kit.send('buyer', '/notification/my/all?direction=sideways'),
      await kit.send('buyer', '/notification/my/all?cursor=nope!'),
    ];
    const cursor = Id.create().value;
    const inventedCursor = await kit.send('buyer', `/notification/my/all?cursor=${cursor}`);
    const operator = await kit.send('buyer', '/notification/my/all?type[$ne]=order');
    const operatorIds = inboxItems(operator).map((item) => item.id);
    const foreignRows = await NotificationModel.countDocuments({
      _id: { $in: operatorIds },
      userId: { $ne: harness.userIds.buyer },
    });

    kit.evidence('NOT-07', {
      statuses: kit.statuses(attempts).join(','),
      codes: attempts.map(errorCode).join(','),
      inventedCursorStatus: inventedCursor.status,
      inventedCursorItems: inboxItems(inventedCursor).length,
      operatorStatus: operator.status,
      operatorForeignRows: foreignRows,
    });
    for (const attempt of attempts) expectRejected(attempt, 'abusive inbox query');
    expect(inventedCursor.accepted).toBe(true);
    for (const item of inboxItems(inventedCursor)) expect(item.id < cursor).toBe(true);
    expect(operator.accepted).toBe(true);
    expect(foreignRows).toBe(0);
  }, 30_000);

  it('NOT-08 keeps read state consistent when the same row is raced', async () => {
    const { notificationId } = await seedNotification();
    harness.events.length = 0;
    const attempts = await kit.race(6, async () =>
      kit.send('buyer', `/notification/my/${notificationId}/read`, { method: 'PATCH' }),
    );
    const doc = await NotificationModel.findById(notificationId).lean();
    const readEvents = harness.events.filter((event) => event === 'notification.read');

    kit.evidence('NOT-08', {
      statuses: kit.statuses(attempts).join(','),
      accepted: kit.accepted(attempts).length,
      isRead: doc?.isRead,
      readAt: doc?.readAt !== null,
      version: doc?.version,
      readEvents: readEvents.length,
    });
    expect(doc?.isRead).toBe(true);
    expect(doc?.readAt).not.toBeNull();
    expect(doc?.version).toBe(kit.accepted(attempts).length);
    expect(readEvents.length).toBeLessThanOrEqual(kit.accepted(attempts).length);
  }, 60_000);

  it('NOT-09 ignores mass-assigned fields on bulk read', async () => {
    const { notificationId } = await seedNotification();
    const othersBefore = await otherUnreadIds();
    const bulk = await kit.send('buyer', '/notification/my/read-all', {
      method: 'PATCH',
      body: {
        userId: harness.userIds.vendor,
        isRead: false,
        deleted: { deleted: true },
        type: 'system',
        title: 'Overwritten',
      },
    });
    const doc = await NotificationModel.findById(notificationId).lean();
    const othersAfter = await otherUnreadIds();

    kit.evidence('NOT-09', {
      status: bulk.status,
      userId: doc?.userId,
      isRead: doc?.isRead,
      deleted: doc?.deleted.deleted,
      type: doc?.type,
      title: doc?.title,
    });
    expect(bulk.accepted).toBe(true);
    expect(doc?.userId).toBe(harness.userIds.buyer);
    expect(doc?.isRead).toBe(true);
    expect(doc?.deleted.deleted).toBe(false);
    expect(doc?.type).toBe('order');
    expect(doc?.title).toBe('Order placed');
    expect(othersAfter).toEqual(othersBefore);
  }, 30_000);

  it('NOT-10 fails closed on malformed and invented notification ids', async () => {
    const { notificationId } = await seedNotification();
    const attempts = [
      await kit.send('buyer', '/notification/my/abc/read', { method: 'PATCH' }),
      await kit.send('buyer', `/notification/my/${'a'.repeat(41)}/read`, { method: 'PATCH' }),
      await kit.send('buyer', '/notification/my/not-a-uuid/read', { method: 'PATCH' }),
      await kit.send('buyer', `/notification/my/${Id.create().value}/read`, { method: 'PATCH' }),
      await kit.send('buyer', `/notification/my/${Id.create().value}`, { method: 'DELETE' }),
      await kit.sendAnonymously(`/notification/my/${notificationId}/read`, { method: 'PATCH' }),
    ];
    const doc = await NotificationModel.findById(notificationId).lean();

    kit.evidence('NOT-10', {
      statuses: kit.statuses(attempts).join(','),
      codes: attempts.map(errorCode).join(','),
      isRead: doc?.isRead,
      deleted: doc?.deleted.deleted,
    });
    for (const attempt of attempts) expectRejected(attempt, 'malformed or invented id');
    expectUnauthorized(attempts[5] as AttackResult, 'anonymous inbox write');
    expect(doc?.isRead).toBe(false);
    expect(doc?.deleted.deleted).toBe(false);
  }, 30_000);
});
