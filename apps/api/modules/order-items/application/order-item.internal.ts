import type {
  OrderItemCancelInput,
  OrderItemFailureInput,
  OrderItemInput,
  OrderItemRestoreInput,
  OrderItemUpdateInput,
} from '@ecomerece/contracts';
import { type OrderItemReadModel, OrderItemsAggregate } from '@ecomerece/domain';
import type { IEvent } from '@ecomerece/domain/events/event-bus.interface';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { Reason } from '@ecomerece/domain/value-objects/reason.vo';
import type { OrderItemResponseReadModel } from '@ecomerece/shared';
import { BaseService } from '../../../core/services/base.services';
import { BadRequestError } from '../../../errors/app-error';
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

  async deleteOrderItem(itemId: Id, reason: Reason, actorId: Id): Promise<IEvent[]> {
    const [item] = await this.loadItems([{ id: itemId }]);
    item.deleteItem(reason, actorId);
    await this.itemsRepo.Save(item);
    return item.pullEvents();
  }

  async recoverOrderItem(itemId: Id, actorId: Id): Promise<IEvent[]> {
    const [item] = await this.loadItems([{ id: itemId }]);
    item.recoverItem(actorId);
    await this.itemsRepo.Save(item);
    return item.pullEvents();
  }

  async updateOrderItems(items: OrderItemUpdateInput[]): Promise<IEvent[]> {
    const existingItems = await this.loadItems(items);
    const updateById = new Map(items.map((item) => [item.id.value, item]));

    const updatedItems = existingItems.map((item) => {
      const updateData = updateById.get(item.id.value);
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

  /** Real (non-failed) lines for one vendor, used by vendor order views. */
  async getOrderItemsByVendorId(vendorId: Id): Promise<OrderItemReadModel[]> {
    const items = await this.itemsRepo.FindByVendorId(vendorId);
    return items.map(OrderItemsMapper.aggregateToReadModel);
  }

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

    const quoteById = new Map(items.map((item) => [item.id.value, item]));
    const restoredItems = docs.map((doc) => {
      const quote = quoteById.get(doc._id);
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

  async createOrderItems(items: OrderItemInput[]): Promise<IEvent[]> {
    const aggregates = items.map((item) => OrderItemsAggregate.create(item));

    await this.itemsRepo.createMany(aggregates);

    return aggregates.flatMap((value) => value.pullEvents());
  }
}
