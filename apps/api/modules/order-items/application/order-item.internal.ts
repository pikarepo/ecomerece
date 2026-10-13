import { OrderItemsAggregate } from '@ecomerece/domain';
import type { IEventBus } from '@ecomerece/domain/events/event-bus.interface';
import type { ExpirationDate } from '@ecomerece/domain/value-objects/expiration-date.vo';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { Money } from '@ecomerece/domain/value-objects/money.vo';
import type { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import { BaseService } from '../../../core/services/base.services';
import type { OrderItemsRepository } from '../infrastructure/order-item.repository';

export class OrderItemsInternalService extends BaseService {
  constructor(
    private readonly itemsRepo: OrderItemsRepository,
    private readonly eventBus: IEventBus,
  ) {
    super();
  }

  async createOrderItems(
    items: {
      id: Id;
      orderId: Id;
      vendorId: Id;
      productId: Id;
      variantId: Id;
      quantity: Quantity;
      waitingTime: ExpirationDate;
      price: Money;
    }[],
  ): Promise<void> {
    const item = items.map((value) =>
      OrderItemsAggregate.create({
        id: value.id,
        orderId: value.orderId,
        vendorId: value.vendorId,
        productId: value.productId,
        variantId: value.variantId,
        quantity: value.quantity,
        waitingTime: value.waitingTime,
        price: value.price,
      }),
    );

    await this.itemsRepo.createMany(item);

    const events = item.flatMap((value) => value.pullEvents());
    if (events.length > 0) {
      await this.eventBus.publish(events);
    }
  }
}
