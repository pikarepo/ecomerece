import { type OrderItemReadModel, OrderItemsAggregate } from '@ecomerece/domain';
import type { OrderItemResponseReadModel } from '@ecomerece/shared';
import type { IEvent } from '@ecomerece/domain/events/event-bus.interface';
import type { ExpirationDate } from '@ecomerece/domain/value-objects/expiration-date.vo';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { Money } from '@ecomerece/domain/value-objects/money.vo';
import type { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import type {
  OrderItemCancelInput,
  OrderItemFailureInput,
  OrderItemRestoreInput,
  OrderItemUpdateInput,
} from '@ecomerece/contracts';
import { BadRequestError } from '../../../errors/app-error';
import { BaseService } from '../../../core/services/base.services';
import { OrderItemsMapper } from '../infrastructure/order-item.mapper';
import type { OrderItemsRepository } from '../infrastructure/order-item.repository';

export class OrderItemsInternalService extends BaseService {
  constructor(private readonly itemsRepo: OrderItemsRepository) {
    super();
  }

  /**
   * Loads items by id and fails the whole batch if any id is missing.
   * When `orderId` is given, every item must belong to that order — this is the
   * guard that stops cancelling items from a different order.
   */
  private async loadItems(items: { id: Id }[], orderId?: Id): Promise<OrderItemsAggregate[]> {
    const existingItems = await this.itemsRepo.FindByIds(items.map((value) => value.id));
    if (existingItems.length !== items.length) {
      throw new BadRequestError('Some order items not found.');
    }
    if (orderId && existingItems.some((item) => !item.orderId.equals(orderId))) {
      throw new BadRequestError('Order item does not belong to this order.');
    }
    return existingItems;
  }

  /** Applies a domain transition to each item, saves, and returns raised events. */
  private async transition(
    items: OrderItemsAggregate[],
    apply: (item: OrderItemsAggregate) => OrderItemsAggregate,
  ): Promise<IEvent[]> {
    const changedItems = items.map(apply);
    await this.itemsRepo.SaveMany(changedItems);
    return changedItems.flatMap((value) => value.pullEvents());
  }

  async cancelOrderItems(items: OrderItemCancelInput[]): Promise<IEvent[]> {
    if (items.length === 0) return [];
    const existingItems = await this.loadItems(items, items[0].orderId);
    return this.transition(existingItems, (item) => item.cancel());
  }

  async confirmOrderItems(items: { id: Id }[]): Promise<IEvent[]> {
    return this.transition(await this.loadItems(items), (item) => item.confirm());
  }

  async completeOrderItems(items: { id: Id }[]): Promise<IEvent[]> {
    return this.transition(await this.loadItems(items), (item) => item.complete());
  }

  async returnOrderItems(items: { id: Id }[]): Promise<IEvent[]> {
    return this.transition(await this.loadItems(items), (item) => item.returnItem());
  }

  async refundOrderItems(items: { id: Id }[]): Promise<IEvent[]> {
    return this.transition(await this.loadItems(items), (item) => item.refund());
  }

  async updateOrderItems(items: OrderItemUpdateInput[]): Promise<IEvent[]> {
    const existingItems = await this.loadItems(items);

    const updatedItems = existingItems.map((item) => {
      const updateData = items.find((value) => value.id.equals(item.id));
      if (!updateData) {
        throw new BadRequestError('Update data not found for item.');
      }
      return item.update({
        quantity: updateData.quantity,
        waitingTime: updateData.waitingTime,
        price: updateData.price,
      });
    });

    await this.itemsRepo.SaveMany(updatedItems);

    return updatedItems.flatMap((value) => value.pullEvents());
  }

  /** One item for the API: rejected lines are returned with their reason. */
  async getOrderItemById(id: Id): Promise<OrderItemResponseReadModel | null> {
    return this.itemsRepo.FindResponseById(id);
  }

  /**
   * Items for order transitions: rejected lines are excluded, because they were
   * never reserved and must not cascade into inventory or item status changes.
   */
  async getOrderItemsByOrderId(orderId: Id): Promise<OrderItemReadModel[]> {
    const items = await this.itemsRepo.FindByOrderId(orderId);
    return items.map(OrderItemsMapper.aggregateToReadModel);
  }

  /** Items for the API: rejected lines are included so the buyer sees why. */
  async listOrderItemsWithFailures(orderId: Id): Promise<OrderItemResponseReadModel[]> {
    return this.itemsRepo.FindResponseByOrderId(orderId);
  }

  /** Rejected lines of an order, for a later fulfilment retry. */
  async getFailedOrderItems(orderId: Id): Promise<OrderItemReadModel[]> {
    return this.itemsRepo.FindFailedReadModelsByOrderId(orderId);
  }

  /** One rejected line, for a single-line retry. */
  async getFailedOrderItemById(id: Id): Promise<OrderItemReadModel | null> {
    return this.itemsRepo.FindFailedReadModelById(id);
  }

  /**
   * Reopens rejected lines as real order items using the caller's fresh quote.
   * Whether a line may be restored at all is decided by the aggregate, not here.
   */
  async restoreOrderItemFailures(items: OrderItemRestoreInput[]): Promise<IEvent[]> {
    if (items.length === 0) return [];

    const docs = await this.itemsRepo.FindFailedByIds(items.map((value) => value.id));
    if (docs.length !== items.length) {
      throw new BadRequestError('Some failed order items not found.');
    }

    const restoredItems = docs.map((doc) => {
      const quote = items.find((value) => value.id.value === doc._id);
      if (!quote) {
        throw new BadRequestError('Restore data not found for item.');
      }
      return OrderItemsMapper.persistenceToRestoredAggregate(doc, quote);
    });

    await this.itemsRepo.SaveMany(restoredItems);

    return restoredItems.flatMap((value) => value.pullEvents());
  }

  /**
   * Persists rejected cart lines. They carry no price and hold no stock, so no
   * domain event is raised for them.
   */
  async recordOrderItemFailures(items: OrderItemFailureInput[]): Promise<IEvent[]> {
    await this.itemsRepo.createFailures(items);
    return [];
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
  ): Promise<IEvent[]> {
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

    return item.flatMap((value) => value.pullEvents());
  }
}
