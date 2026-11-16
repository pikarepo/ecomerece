import type { AuthActor } from '@ecomerece/contracts';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { getMyNotificationsQuerySchema } from '@ecomerece/shared';
import type { Context } from 'hono';
import { z } from 'zod';
import { BaseController } from '../../../core/controller/base.controller';
import type { NotificationsApplicationService } from '../application/notifications.app.service';

const idSchema = z.string().trim().min(5).max(40);

export class NotificationsController extends BaseController<NotificationsApplicationService> {
  getMyNotifications = async (c: Context) =>
    this.ok(
      c,
      await this.service.getMyNotifications(
        this.query(c, getMyNotificationsQuerySchema),
        this.actor(c),
      ),
    );

  getUnreadCount = async (c: Context) =>
    this.ok(c, await this.service.getUnreadCount(this.actor(c)));

  markRead = async (c: Context) =>
    this.ok(
      c,
      await this.service.markNotificationRead(
        Id.create(this.param(c, 'id', idSchema)),
        this.actor(c),
      ),
    );

  markAllRead = async (c: Context) =>
    this.ok(c, await this.service.markAllNotificationsRead(this.actor(c)));

  dismiss = async (c: Context) =>
    this.ok(
      c,
      await this.service.dismissNotification(
        Id.create(this.param(c, 'id', idSchema)),
        this.actor(c),
      ),
    );

  private actor(c: Context): AuthActor {
    return c.get('user') as AuthActor;
  }
}
