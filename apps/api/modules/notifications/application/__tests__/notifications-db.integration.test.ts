import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { NotificationModel } from '../../infrastructure/notification.model';
import {
  createApiIntegrationHarness,
  integrationEnabled,
  type ApiIntegrationHarness,
} from '../../../../testing/api-integration-harness';

let harness: ApiIntegrationHarness;

describe.skipIf(!integrationEnabled)('notifications API database integration', () => {
  beforeAll(async () => {
    harness = await createApiIntegrationHarness({ dispatchEvents: true });
  }, 30_000);

  beforeEach(() => {
    harness.events.length = 0;
  });

  afterEach(async () => {
    await harness.cleanup();
  });

  afterAll(async () => {
    if (harness) await harness.close();
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
});
