import { ExpirationDate } from '@ecomerece/domain/value-objects/expiration-date.vo';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { Money } from '@ecomerece/domain/value-objects/money.vo';
import { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import type { IEvent } from '@ecomerece/domain/events/event-bus.interface';
import type { IEventBus } from '@ecomerece/domain/events/event-bus.interface';
import type { AuthActor, IOrderQueries } from '@ecomerece/contracts';
import type {
  CancelMyOrderItemsDto,
  GetAdminPaginatedOrderItemsQueryDto,
  UpdateOrderItemDto,
} from '@ecomerece/shared';
import type { FilterQuery } from 'mongoose';
import { BaseService } from '../../../core/services/base.services';
import type { UnitOfWork } from '../../../core/database/unit-of-work';
import { ForbiddenError, NotFoundError } from '../../../errors/app-error';
import { OrderItemsMapper } from '../infrastructure/order-item.mapper';
import type { OrderItemsPersistence } from '../infrastructure/order-item.model';
import type { OrderItemsRepository } from '../infrastructure/order-item.repository';
import { OrderItemsMessages } from '../presentation/order-items.messages';
import type { OrderItemsInternalService } from './order-item.internal';

/**
 * Order-item use cases.
 *
 * Reads go through the internal service / repository; writes go through the
 * aggregate and publish their events after the transaction commits. Ownership
 * checks use the order module's contract query so this module never imports
 * another module's persistence.
 */
export class OrderItemsApplicationService extends BaseService {
  constructor(
    private readonly itemsInternalService: OrderItemsInternalService,
    private readonly itemsRepo: OrderItemsRepository,
    private readonly orderQueries: IOrderQueries,
    private readonly eventBus: IEventBus,
    private readonly unitOfWork: UnitOfWork,
  ) {
    super();
  }

  /** Throws unless the order exists, is active, and belongs to `actorId`. */
  private async assertOrderOwner(orderId: Id, actorId: Id): Promise<void> {
    const { order, active } = await this.orderQueries.ensureActiveById(orderId);
    if (!order || !active) throw new NotFoundError('Order not found.');
    if (order.buyerId !== actorId.value) {
      throw new ForbiddenError('You do not own this order.');
    }
  }

  /** Runs a single-item state change in a transaction, then publishes events. */
  private async transitionOne(
    itemId: Id,
    actorId: Id,
    run: (items: { id: Id }[]) => Promise<IEvent[]>,
    status: string,
  ) {
    const events = await this.unitOfWork.transaction(() => run([{ id: itemId }]));
    if (events.length > 0) await this.eventBus.publish(events);
    return OrderItemsMessages.orderItemStatusChanged(itemId, actorId, status);
  }

  /**
   * Cancels the given items of an order owned by the authenticated buyer.
   *
   * `orderId` is part of the DTO on purpose: the internal service verifies
   * every item actually belongs to it, which stops a caller from cancelling
   * another order's items by guessing item ids.
   */
  async cancelMyOrderItems(data: CancelMyOrderItemsDto, actor: AuthActor) {
    const orderId = Id.create(data.orderId);
    const actorId = Id.create(actor._id);
    const itemIds = data.itemIds.map((id) => Id.create(id));

    await this.assertOrderOwner(orderId, actorId);

    const events = await this.unitOfWork.transaction(() =>
      this.itemsInternalService.cancelOrderItems(
        itemIds.map((id) => ({ id, orderId })),
      ),
    );

    if (events.length > 0) await this.eventBus.publish(events);

    return OrderItemsMessages.orderItemsCancelled(orderId, actorId, itemIds.length);
  }

  /** Buyer: the items of one of their own orders, rejected lines included. */
  async getMyOrderItemsByOrderId(orderId: string, actor: AuthActor) {
    const id = Id.create(orderId);
    const actorId = Id.create(actor._id);
    await this.assertOrderOwner(id, actorId);
    return this.itemsInternalService.listOrderItemsWithFailures(id);
  }

  /** Any authenticated caller: one item by id. */
  async getOrderItemById(id: string) {
    const item = await this.itemsInternalService.getOrderItemById(Id.create(id));
    if (!item) throw new NotFoundError('Order item not found.');
    return item;
  }

  /** Admin: cursor-paginated order items with optional filters. */
  async findAdminPaginatedOrderItems(query: GetAdminPaginatedOrderItemsQueryDto) {
    const filter: FilterQuery<OrderItemsPersistence> = {};
    if (query.orderId) filter.orderId = Id.create(query.orderId).value;
    if (query.status) filter.status = query.status;
    if (query.deleted !== undefined) filter['deleted.deleted'] = query.deleted;
    const cursor = query.cursor ? Id.create(query.cursor) : undefined;
    const limit = query.limit ? Quantity.create(query.limit) : undefined;

    const result = await this.itemsRepo.FindPaginated({
      filter,
      cursor,
      limit,
      direction: query.direction,
    });
    return {
      data: result.data,
      meta: result.meta,
    };
  }

  /** Admin: update quantity / waiting time / price of one item. */
  async updateOrderItem(id: string, data: UpdateOrderItemDto, actor: AuthActor) {
    const itemId = Id.create(id);
    const actorId = Id.create(actor._id);
    const update = {
      id: itemId,
      quantity: Quantity.create(data.quantity),
      waitingTime: ExpirationDate.create(data.waitingTime),
      price: Money.create(data.price),
    };

    const events = await this.unitOfWork.transaction(() =>
      this.itemsInternalService.updateOrderItems([update]),
    );
    if (events.length > 0) await this.eventBus.publish(events);

    return OrderItemsMessages.orderItemUpdated(itemId, actorId);
  }

  confirmOrderItem(id: string, actor: AuthActor) {
    const itemId = Id.create(id);
    const actorId = Id.create(actor._id);
    return this.transitionOne(
      itemId,
      actorId,
      (items) => this.itemsInternalService.confirmOrderItems(items),
      'confirmed',
    );
  }

  completeOrderItem(id: string, actor: AuthActor) {
    const itemId = Id.create(id);
    const actorId = Id.create(actor._id);
    return this.transitionOne(
      itemId,
      actorId,
      (items) => this.itemsInternalService.completeOrderItems(items),
      'completed',
    );
  }

  returnOrderItem(id: string, actor: AuthActor) {
    const itemId = Id.create(id);
    const actorId = Id.create(actor._id);
    return this.transitionOne(
      itemId,
      actorId,
      (items) => this.itemsInternalService.returnOrderItems(items),
      'returned',
    );
  }

  refundOrderItem(id: string, actor: AuthActor) {
    const itemId = Id.create(id);
    const actorId = Id.create(actor._id);
    return this.transitionOne(
      itemId,
      actorId,
      (items) => this.itemsInternalService.refundOrderItems(items),
      'refunded',
    );
  }
}
