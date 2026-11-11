import type { OrderItemCreatedEvent } from '@ecomerece/domain';
import type { IEvent, IEventHandler } from '@ecomerece/domain/events/event-bus.interface';
import { statsBufferService } from '../StatsBufferService';

type OrderItemCreatedPayload = OrderItemCreatedEvent['payload'];

export class OrderItemCreatedStatsHandler implements IEventHandler<OrderItemCreatedPayload> {
  async handle(event: IEvent<OrderItemCreatedPayload>): Promise<void> {
    const { vendorId, productId, orderId, quantity, totalPrice } = event.payload;

    statsBufferService.track({
      entity: { type: 'vendor', id: vendorId.value },
      metrics: { purchases: 1, revenue: totalPrice.value, quantity: quantity.value },
    });

    statsBufferService.track({
      entity: { type: 'product', id: productId.value },
      metrics: { purchases: 1, revenue: totalPrice.value, quantity: quantity.value },
    });

    statsBufferService.track({
      entity: { type: 'order', id: orderId.value },
      metrics: { revenue: totalPrice.value, quantity: quantity.value },
    });
  }
}
