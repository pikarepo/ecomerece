import { OrderAggregate } from '@ecomerece/domain';
import { ExpirationDate } from '@ecomerece/domain/value-objects/expiration-date.vo';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { Money } from '@ecomerece/domain/value-objects/money.vo';
import { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import { Reason } from '@ecomerece/domain/value-objects/reason.vo';
import { FullAddressVO } from '@ecomerece/domain/value-objects/street-address.vo';
import type {
  createMyOrderDtoType,
  GetAdminPaginatedOrdersQueryDto,
  GetMyOrdersQueryDto,
  orderReasonDtoType,
  updateOrderDtoType,
} from '@ecomerece/shared';
import type { FilterQuery } from 'mongoose';
import type { IEvent } from '@ecomerece/domain/events/event-bus.interface';
import type { IEventBus } from '@ecomerece/domain/events/event-bus.interface';
import type {
  IAddressQueries,
  IInventoryReservation,
  IOrderItemsWriter,
  IProductQueries,
  IProductVariantQueries,
} from '@ecomerece/contracts';
import type { OrderItemReadModel } from '@ecomerece/domain/modules/order-items/read-models/order-items.read-model';
import type { OrderItemsQueryAdapter } from '../../order-items/infrastructure/order-items-query.adapter';
import { BaseService } from '../../../core/services/base.services';
import type { UnitOfWork } from '../../../core/database/unit-of-work';
import { BadRequestError } from '../../../errors/app-error';
import type { AuthActor } from '@ecomerece/contracts';
import { OrderMapper } from '../infrastructure/order.mapper';
import type { OrderPersistence } from '../infrastructure/order.model';
import type { OrderRepository } from '../infrastructure/order.repository';
import { OrderMessages } from '../presentation/order.messages';

/** Order item fields needed to cascade a state change into inventory. */
type OrderItemRef = { id: Id; orderId: Id; variantId: Id; quantity: Quantity };

type InventoryTransition = 'complete' | 'release' | 'restock';

/** A cart line that survived product, variant and inventory validation. */
type ResolvedOrderItem = {
  variantId: Id;
  productId: Id;
  vendorId: Id;
  quantity: Quantity;
  price: number;
};

/**
 * Order use cases.
 *
 * `createMyOrder` is the only write path that spans several modules: it
 * validates the cart through contract queries, reserves stock through
 * `IInventoryReservation`, writes items through `IOrderItemsWriter`, and saves
 * the order aggregate inside one `UnitOfWork.transaction`. Item and order
 * events are published only after that transaction commits.
 */
export class OrderApplicationService extends BaseService {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly addressQueries: IAddressQueries,
    private readonly variantQueries: IProductVariantQueries,
    private readonly productQueries: IProductQueries,
    private readonly eventBus: IEventBus,
    private readonly inventoryReservation: IInventoryReservation,
    private readonly orderItemsWriter: IOrderItemsWriter,
    private readonly orderItemsQueries: OrderItemsQueryAdapter,
    private readonly unitOfWork: UnitOfWork,
  ) {
    super();
  }

  /**
   * Validates the cart and reserves stock.
   *
   * The contract queries already return only active, non-deleted variants and
   * non-deleted, non-blocked products, so no extra `validIds` filtering is
   * needed. The inventory port returns the ids it could reserve; any line it
   * rejects is dropped, preserving the previous "partial order" behaviour.
   */
  private async resolveBuyableItems(
    items: { variantId: Id; quantity: Quantity }[],
    actorId: Id,
  ): Promise<ResolvedOrderItem[]> {
    const variants = await this.variantQueries.verifyAndGet(
      items.map((item) => item.variantId),
    );
    const products = await this.productQueries.verifyAndGet(
      variants.variantReadModel.map((variant) => Id.create(variant.productId)),
    );
    const productById = new Map(products.productReadModel.map((product) => [product.id, product]));
    const variantById = new Map(variants.variantReadModel.map((variant) => [variant.id, variant]));

    // Join request lines with their variant + product read models. A missing
    // entry means the variant or product became unavailable between requests.
    const candidates: ResolvedOrderItem[] = [];
    for (const item of items) {
      const variant = variantById.get(item.variantId.value);
      const product = variant && productById.get(variant.productId);
      if (!variant || !product) continue;
      candidates.push({
        variantId: item.variantId,
        productId: Id.create(variant.productId),
        vendorId: Id.create(product.vendorId),
        quantity: item.quantity,
        price: variant.price,
      });
    }

    // Reserve before building the order so the total only covers held stock.
    const { buyableIds } = await this.inventoryReservation.reserve(
      candidates.map(({ variantId, quantity }) => ({ variantId, quantity })),
      actorId,
    );
    const buyable = new Set(buyableIds.map((id) => id.value));
    return candidates.filter((item) => buyable.has(item.variantId.value));
  }

  /**
   * Creates an order for the authenticated buyer.
   *
   * Flow:
   * 1. build value objects from the DTO (new ids are always generated server-side),
   * 2. reject a missing/inactive address before opening a transaction,
   * 3. inside the transaction: enforce the idempotency key, resolve + reserve
   *    items, create the order and item rows, and raise `order.created`,
   * 4. after commit: publish item and order events together.
   *
   * Publishing after the transaction is deliberate: consumers must never react
   * to an order that rolled back (covered by `order-create-commit.test.ts`).
   */





  async createMyOrder(data: createMyOrderDtoType, actor: AuthActor) {

    const orderId = Id.create();
    const idempotentKey = Id.create(data.idempotentKey);
    const addressId = Id.create(data.addressId);
    const actorId = Id.create(actor._id);
    const waitingTime = ExpirationDate.create(data.waitingTime);
    const items = data.items.map((value) => ({
      variantId: Id.create(value.variantId),
      quantity: Quantity.create(value.quantity),
    }));
    if (waitingTime.remainingHours > 4) throw new BadRequestError('Waiting time must not be far in the future.');
    // Address is only a guard; read it before the transaction to fail fast.
    const { address, active } = await this.addressQueries.ensureActiveById(addressId, actorId);

    if (!address || !active) throw new BadRequestError('Address not found or inactive.');

    const { order, itemEvents } = await this.unitOfWork.transaction(async () => {
      await this.orderRepo.EnsureUniqueImpodentKey(idempotentKey);
      const orderItems = await this.resolveBuyableItems(items, actorId);
      const order = OrderAggregate.create({
        id: orderId,
        idempotentKey,
        totalPrice: Money.create(
          orderItems.reduce((sum, item) => sum + item.quantity.value * item.price, 0),
        ),
        buyerId: actorId,
        address: FullAddressVO.create(address.fullAddress),
      });
      const itemEvents = await this.orderItemsWriter.create(
        orderItems.map((item) => ({
          id: Id.create(),
          orderId,
          vendorId: item.vendorId,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          waitingTime,
          price: Money.create(item.price),
        })),
      );
      // Aggregate raises `order.created`; events stay buffered until commit.
      order.createOrder();
      await this.orderRepo.Create(order);
      return { order, itemEvents };
    });

    const events = [...itemEvents, ...order.pullEvents()];
    if (events.length > 0) await this.eventBus.publish(events);
    return OrderMessages.orderCreated(
      orderId,
      actorId,
      addressId,
      OrderMapper.aggregateToResponseReadModel(order),
    );
  }

  /** Public: the authenticated user's own non-deleted orders. */
  async getMyOrders(query: GetMyOrdersQueryDto, buyerId: string) {
    const filter: FilterQuery<OrderPersistence> = {
      buyerId: Id.create(buyerId).value,
      'deleted.deleted': false,
    };
    const cursor = query.cursor ? Id.create(query.cursor) : undefined;
    const limit = query.limit ? Quantity.create(query.limit) : undefined;
    const result = await this.orderRepo.FindPaginated({
      filter,
      cursor,
      limit,
      direction: query.direction,
    });
    return {
      data: result.data.map((order) => OrderMapper.aggregateToReadModel(order)),
      meta: result.meta,
    };
  }

  /** Admin: all orders — optional buyerId / deleted filters, no baseline scope. */
  async findAdminPaginatedOrders(query: GetAdminPaginatedOrdersQueryDto) {
    const filter: FilterQuery<OrderPersistence> = {};
    if (query.buyerId) filter.buyerId = Id.create(query.buyerId).value;
    if (query.deleted !== undefined) filter['deleted.deleted'] = query.deleted;
    const cursor = query.cursor ? Id.create(query.cursor) : undefined;
    const limit = query.limit ? Quantity.create(query.limit) : undefined;
    const result = await this.orderRepo.FindPaginated({
      filter,
      cursor,
      limit,
      direction: query.direction,
    });
    return {
      data: result.data.map((order) => OrderMapper.aggregateToReadModel(order)),
      meta: result.meta,
    };
  }

  /** Read: the buyer's own order, scoped by the authenticated actor. */
  async getMyOrderById(id: string, actor: AuthActor) {
    const orderId = Id.create(id);
    const actorId = Id.create(actor._id);
    const order = await this.orderRepo.FindByIdOrThrow(orderId);
    if (!order.buyerId.equals(actorId)) {
      throw new BadRequestError('You do not own this order.');
    }
    return OrderMapper.aggregateToResponseReadModel(order);
  }

  /** Admin: any order by id, including soft-deleted rows. */
  async getAdminOrderById(id: string) {
    const order = await this.orderRepo.FindByIdOrThrow(Id.create(id));
    return OrderMapper.aggregateToResponseReadModel(order);
  }

  /** Loads the order items so transitions can cascade to items and inventory. */
  private async itemRefs(orderId: Id): Promise<OrderItemRef[]> {
    const items = await this.orderItemsQueries.getByOrderId(orderId);
    return items.map((item: OrderItemReadModel) => ({
      id: Id.create(item._id),
      orderId,
      variantId: Id.create(item.variantId),
      quantity: Quantity.create(item.quantity),
    }));
  }

  private async publish(events: IEvent[]): Promise<void> {
    if (events.length > 0) await this.eventBus.publish(events);
  }

  /**
   * Keeps the inventory module in step with the order state machine.
   * `complete` consumes held stock; `release` returns it on cancellation;
   * `restock` returns fulfilled stock on a return.
   */
  private async applyInventoryTransition(
    action: InventoryTransition | null,
    items: OrderItemRef[],
    actorId: Id,
  ): Promise<void> {
    if (!action || items.length === 0) return;
    const lines = items.map((item) => ({ variantId: item.variantId, quantity: item.quantity }));
    if (action === 'complete') await this.inventoryReservation.complete(lines, actorId);
    else if (action === 'release') await this.inventoryReservation.release(lines, actorId);
    else await this.inventoryReservation.restock(lines, actorId);
  }

  /**
   * Runs an order transition, its item cascade and the matching inventory
   * change in one transaction. Events stay buffered until the transaction commits.
   */
  private async transitionOrder(
    orderId: Id,
    actorId: Id,
    apply: (order: OrderAggregate) => void,
    cascade: (items: OrderItemRef[]) => Promise<IEvent[]>,
    inventoryAction?: (order: OrderAggregate) => InventoryTransition | null,
  ): Promise<OrderAggregate> {
    const { order, itemEvents } = await this.unitOfWork.transaction(async () => {
      const order = await this.orderRepo.FindByIdOrThrow(orderId);
      const items = await this.itemRefs(orderId);
      const action = inventoryAction?.(order) ?? null;
      // Validate the state transition before any side effect, so a rejected
      // transition never reaches the item cascade or the inventory module.
      apply(order);
      const itemEvents = await cascade(items);
      await this.applyInventoryTransition(action, items, actorId);
      await this.orderRepo.Save(order);
      return { order, itemEvents };
    });
    await this.publish([...itemEvents, ...order.pullEvents()]);
    return order;
  }

  async cancelMyOrder(id: string, data: orderReasonDtoType, actor: AuthActor) {
    const orderId = Id.create(id);
    const actorId = Id.create(actor._id);
    const reason = Reason.create(data.reason);
    await this.transitionOrder(
      orderId,
      actorId,
      (order) => {
        if (!order.buyerId.equals(actorId)) {
          throw new BadRequestError('You do not own this order.');
        }
        order.cancelOrder(reason, actorId);
      },
      (items) => this.orderItemsWriter.cancel(items),
      () => 'release',
    );
    return OrderMessages.orderCancelled(orderId, actorId, reason);
  }

  async confirmOrder(id: string, actor: AuthActor) {
    const orderId = Id.create(id);
    const actorId = Id.create(actor._id);
    await this.transitionOrder(
      orderId,
      actorId,
      (order) => order.confirmOrder(actorId),
      (items) => this.orderItemsWriter.confirm(items),
    );
    return OrderMessages.orderConfirmed(orderId, actorId);
  }

  async completeOrder(id: string, actor: AuthActor) {
    const orderId = Id.create(id);
    const actorId = Id.create(actor._id);
    await this.transitionOrder(
      orderId,
      actorId,
      (order) => order.completeOrder(actorId),
      (items) => this.orderItemsWriter.complete(items),
      () => 'complete',
    );
    return OrderMessages.orderCompleted(orderId, actorId);
  }

  async returnOrder(id: string, data: orderReasonDtoType, actor: AuthActor) {
    const orderId = Id.create(id);
    const actorId = Id.create(actor._id);
    const reason = Reason.create(data.reason);
    await this.transitionOrder(
      orderId,
      actorId,
      (order) => order.returnOrder(reason, actorId),
      (items) => this.orderItemsWriter.returnItems(items),
      // A completed order has already consumed its reservation; a confirmed
      // one still holds it, so it is released instead of restocked.
      (order) => (order.status.status === 'completed' ? 'restock' : 'release'),
    );
    return OrderMessages.orderReturned(orderId, actorId, reason);
  }

  async refundOrder(id: string, data: orderReasonDtoType, actor: AuthActor) {
    const orderId = Id.create(id);
    const actorId = Id.create(actor._id);
    const reason = Reason.create(data.reason);
    await this.transitionOrder(
      orderId,
      actorId,
      (order) => order.refundOrder(reason, actorId),
      (items) => this.orderItemsWriter.refund(items),
      // A refund is financial only: stock already came back through a return,
      // or never left the shelf.
      () => null,
    );
    return OrderMessages.orderRefunded(orderId, actorId, reason);
  }

  async updateOrder(id: string, data: updateOrderDtoType, actor: AuthActor) {
    const orderId = Id.create(id);
    const actorId = Id.create(actor._id);
    const order = await this.orderRepo.FindByIdOrThrow(orderId);
    order.updateOrder(
      Money.create(data.totalPrice),
      FullAddressVO.create(data.address),
      actorId,
    );
    await this.orderRepo.Save(order);
    await this.publish(order.pullEvents());
    return OrderMessages.orderUpdated(orderId, actorId);
  }

  async deleteOrder(id: string, data: orderReasonDtoType, actor: AuthActor) {
    const orderId = Id.create(id);
    const actorId = Id.create(actor._id);
    const reason = Reason.create(data.reason);
    const order = await this.orderRepo.FindByIdOrThrow(orderId);
    order.deleteOrder(reason, actorId);
    await this.orderRepo.Save(order);
    await this.publish(order.pullEvents());
    return OrderMessages.orderDeleted(orderId, actorId, reason);
  }

  async recoverOrder(id: string, actor: AuthActor) {
    const orderId = Id.create(id);
    const actorId = Id.create(actor._id);
    const order = await this.orderRepo.FindByIdOrThrow(orderId);
    order.recoverOrder(actorId);
    await this.orderRepo.Save(order);
    await this.publish(order.pullEvents());
    return OrderMessages.orderRecovered(orderId, actorId);
  }
}
