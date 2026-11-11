import type {
  IOrderItemsWriter,
  OrderItemCancelInput,
  OrderItemInput,
  OrderItemUpdateInput,
} from '@ecomerece/contracts';
import type { IEvent } from '@ecomerece/domain/events/event-bus.interface';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { OrderItemsInternalService } from '../application/order-item.internal';

export class OrderItemsWriterAdapter implements IOrderItemsWriter {
  constructor(private readonly itemsService: OrderItemsInternalService) {}

  create(items: OrderItemInput[]): Promise<IEvent[]> {
    return this.itemsService.createOrderItems(items);
  }
  cancel(items: OrderItemCancelInput[]): Promise<IEvent[]> {
    return this.itemsService.cancelOrderItems(items);
  }
  update(items: OrderItemUpdateInput[]): Promise<IEvent[]> {
    return this.itemsService.updateOrderItems(items);
  }
  confirm(items: { id: Id }[]): Promise<IEvent[]> {
    return this.itemsService.confirmOrderItems(items);
  }
  complete(items: { id: Id }[]): Promise<IEvent[]> {
    return this.itemsService.completeOrderItems(items);
  }
  returnItems(items: { id: Id }[]): Promise<IEvent[]> {
    return this.itemsService.returnOrderItems(items);
  }
  refund(items: { id: Id }[]): Promise<IEvent[]> {
    return this.itemsService.refundOrderItems(items);
  }
}
