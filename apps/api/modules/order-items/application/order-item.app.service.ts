import type {
  AuthActor,
  IInventoryReservation,
  IOrderQueries,
  IVendorQueries,
} from '@ecomerece/contracts';
import type { IEvent, IEventBus } from '@ecomerece/domain/events/event-bus.interface';
import { ExpirationDate } from '@ecomerece/domain/value-objects/expiration-date.vo';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { Money } from '@ecomerece/domain/value-objects/money.vo';
import { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import { Reason } from '@ecomerece/domain/value-objects/reason.vo';
import type {
  CancelMyOrderItemsDto,
  DeleteOrderItemDto,
  GetAdminPaginatedOrderItemsQueryDto,
  GetVendorPaginatedOrderItemsQueryDto,
  UpdateOrderItemDto,
} from '@ecomerece/shared';
import type { FilterQuery } from 'mongoose';
import type { UnitOfWork } from '../../../core/database/unit-of-work';
import { BaseService } from '../../../core/services/base.services';
import { ForbiddenError, NotFoundError } from '../../../errors/app-error';
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
    private readonly vendorQueries: IVendorQueries,
    private readonly eventBus: IEventBus,
    private readonly unitOfWork: UnitOfWork,
    private readonly inventoryReservation?: IInventoryReservation,
  ) {
    super();
  }

  /** Resolves the caller's verified vendor, or refuses the vendor-only action. */
  private async resolveVendorId(actorId: Id): Promise<Id> {
    const vendor = await this.vendorQueries.ensureActiveByUserId(actorId);
    if (!vendor.vendor || !vendor.active) {
      throw new ForbiddenError('You do not own an active vendor.');
    }
    return Id.create(vendor.vendor.id);
  }

  /** Throws unless the item exists and belongs to the caller's vendor. */
  private async assertVendorOwnsItem(itemId: Id, vendorId: Id): Promise<void> {
    const item = await this.itemsRepo.FindReadModelById(itemId);
    if (!item) throw new NotFoundError('Order item not found.');
    if (item.vendorId !== vendorId.value) {
      throw new ForbiddenError('This order item does not belong to your vendor.');
    }
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
    const events = await this.unitOfWork.transaction(async () => {
      const item = await this.itemsRepo.FindById(itemId);
      const events = await run([{ id: itemId }]);
      if (this.inventoryReservation && item) {
        const line = [{ variantId: item.variantId, quantity: item.quantity }];
        if (status === 'confirmed') {
          await this.inventoryReservation.reserve(line, actorId);
        } else if (status === 'completed') {
          await this.inventoryReservation.soldOut(line, actorId);
        } else if (status === 'returned' || status === 'refunded') {
          await this.inventoryReservation.unsold(line, actorId);
        }
      }
      return events;
    });
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
      this.itemsInternalService.cancelOrderItems(itemIds.map((id) => ({ id, orderId }))),
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

  /** Vendor: non-deleted items belonging to the caller's own vendor. */
  async findVendorPaginatedOrderItems(
    query: GetVendorPaginatedOrderItemsQueryDto,
    actor: AuthActor,
  ) {
    const vendorId = await this.resolveVendorId(Id.create(actor._id));
    const filter: FilterQuery<OrderItemsPersistence> = {
      vendorId: vendorId.value,
      'deleted.deleted': false,
    };
    if (query.orderId) filter.orderId = Id.create(query.orderId).value;
    if (query.status) filter.status = query.status;
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

  /** Vendor: one of their own items, scoped by the verified vendor id. */
  async getVendorOrderItemById(id: string, actor: AuthActor) {
    const itemId = Id.create(id);
    const vendorId = await this.resolveVendorId(Id.create(actor._id));
    await this.assertVendorOwnsItem(itemId, vendorId);
    const item = await this.itemsRepo.FindResponseById(itemId);
    if (!item) throw new NotFoundError('Order item not found.');
    return item;
  }

  /** Vendor: update quantity / waiting time / price of an item they own. */
  async updateVendorOrderItem(id: string, data: UpdateOrderItemDto, actor: AuthActor) {
    const itemId = Id.create(id);
    const actorId = Id.create(actor._id);
    const vendorId = await this.resolveVendorId(actorId);
    await this.assertVendorOwnsItem(itemId, vendorId);

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

  /** Runs a vendor transition only after proving the item is theirs. */
  private async vendorTransitionOne(
    itemId: Id,
    actor: AuthActor,
    run: (items: { id: Id }[]) => Promise<IEvent[]>,
    status: string,
  ) {
    const actorId = Id.create(actor._id);
    const vendorId = await this.resolveVendorId(actorId);
    await this.assertVendorOwnsItem(itemId, vendorId);
    return this.transitionOne(itemId, actorId, run, status);
  }

  vendorConfirmOrderItem(id: string, actor: AuthActor) {
    const itemId = Id.create(id);
    return this.vendorTransitionOne(
      itemId,
      actor,
      (items) => this.itemsInternalService.confirmOrderItems(items),
      'confirmed',
    );
  }

  vendorCompleteOrderItem(id: string, actor: AuthActor) {
    const itemId = Id.create(id);
    return this.vendorTransitionOne(
      itemId,
      actor,
      (items) => this.itemsInternalService.completeOrderItems(items),
      'completed',
    );
  }

  vendorReturnOrderItem(id: string, actor: AuthActor) {
    const itemId = Id.create(id);
    return this.vendorTransitionOne(
      itemId,
      actor,
      (items) => this.itemsInternalService.returnOrderItems(items),
      'returned',
    );
  }

  vendorRefundOrderItem(id: string, actor: AuthActor) {
    const itemId = Id.create(id);
    return this.vendorTransitionOne(
      itemId,
      actor,
      (items) => this.itemsInternalService.refundOrderItems(items),
      'refunded',
    );
  }

  /** Admin: soft-delete any item, keeping its row for recovery. */
  async deleteOrderItem(id: string, data: DeleteOrderItemDto, actor: AuthActor) {
    const itemId = Id.create(id);
    const actorId = Id.create(actor._id);
    const reason = Reason.create(data.reason);

    const events = await this.unitOfWork.transaction(() =>
      this.itemsInternalService.deleteOrderItem(itemId, reason, actorId),
    );
    if (events.length > 0) await this.eventBus.publish(events);

    return OrderItemsMessages.orderItemDeleted(itemId, actorId, reason);
  }

  /** Admin: restore a soft-deleted item. */
  async recoverOrderItem(id: string, actor: AuthActor) {
    const itemId = Id.create(id);
    const actorId = Id.create(actor._id);

    const events = await this.unitOfWork.transaction(() =>
      this.itemsInternalService.recoverOrderItem(itemId, actorId),
    );
    if (events.length > 0) await this.eventBus.publish(events);

    return OrderItemsMessages.orderItemRecovered(itemId, actorId);
  }
}
