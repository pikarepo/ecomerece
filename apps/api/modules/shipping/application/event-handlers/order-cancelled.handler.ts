import type { OrderCancelledEvent } from '@ecomerece/domain';
import type { IEventHandler } from '@ecomerece/domain/events/event-bus.interface';
import type { ShippingApplicationService } from '../shipping.app.service';

/**
 * A cancelled order must not keep parcels in flight. Shipping reacts to the
 * order module's event instead of the order module calling into shipping, so
 * the dependency stays one-way and the cancellation is the only trigger.
 */
export class OrderCancelledHandler implements IEventHandler<OrderCancelledEvent['payload']> {
  constructor(private readonly shippingService: ShippingApplicationService) {}

  async handle(event: OrderCancelledEvent): Promise<void> {
    const { orderId, reason, actorId } = event.payload;

    await this.shippingService.cancelShipmentsForOrder(orderId, reason, actorId);
  }
}
