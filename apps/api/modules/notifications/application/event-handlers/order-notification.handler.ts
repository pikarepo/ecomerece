import type { IOrderQueries } from '@ecomerece/contracts';
import type { IEvent, IEventHandler } from '@ecomerece/domain/events/event-bus.interface';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { NotificationsApplicationService } from '../notifications.app.service';

type OrderEventPayload = { orderId: Id };

/**
 * Registered for `order.created` and `order.cancelled`. The order contract is
 * read-only here: notifications never change order state.
 */
export class OrderNotificationHandler implements IEventHandler<OrderEventPayload> {
  constructor(
    private readonly notifications: NotificationsApplicationService,
    private readonly orderQueries: IOrderQueries,
  ) {}

  async handle(event: IEvent<OrderEventPayload>): Promise<void> {
    const { order } = await this.orderQueries.ensureActiveById(event.payload.orderId);
    if (!order) return;

    const isCancelled = event.type === 'order.cancelled';

    await this.notifications.createNotification({
      userId: Id.create(order.buyerId),
      type: 'order',
      title: isCancelled ? 'Order cancelled' : 'Order placed',
      body: isCancelled
        ? `Order ${order.id} was cancelled. Anything already paid is returned to the original payment method.`
        : `Order ${order.id} was placed with ${order.vendorIds.length} vendor(s) for a total of ${order.totalPrice}.`,
      referenceId: Id.create(order.id),
    });
  }
}
