import type {
  AuthActor,
  CartOrderResult,
  CreateCartOrderInput,
  IAddressQueries,
  IInventoryReservation,
  IOrderItemsQueries,
  IOrderItemsWriter,
  IProductQueries,
  IProductVariantQueries,
  IVendorQueries,
  OrderItemRestoreInput,
} from '@ecomerece/contracts';
import { OrderAggregate, type OrderItemFailureReason, OrderTypeVO } from '@ecomerece/domain';
import type { IEvent, IEventBus } from '@ecomerece/domain/events/event-bus.interface';
import type { OrderItemReadModel } from '@ecomerece/domain/modules/order-items/read-models/order-items.read-model';
import { ExpirationDate } from '@ecomerece/domain/value-objects/expiration-date.vo';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { Money } from '@ecomerece/domain/value-objects/money.vo';
import { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import { Reason } from '@ecomerece/domain/value-objects/reason.vo';
import { FullAddressVO } from '@ecomerece/domain/value-objects/street-address.vo';
import type {
  buyNowOrderDtoType,
  createMyOrderDtoType,
  GetAdminPaginatedOrdersQueryDto,
  GetMyOrdersQueryDto,
  GetVendorPaginatedOrdersQueryDto,
  orderReasonDtoType,
  updateOrderDtoType,
} from '@ecomerece/shared';
import type { FilterQuery } from 'mongoose';
import type { UnitOfWork } from '../../../core/database/unit-of-work';
import { BaseService } from '../../../core/services/base.services';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../../errors/app-error';
import { OrderMapper } from '../infrastructure/order.mapper';
import type { OrderPersistence } from '../infrastructure/order.model';
import type { OrderRepository } from '../infrastructure/order.repository';
import { OrderMessages } from '../presentation/order.messages';

/** Orders cannot reserve stock further than this many hours ahead. */
const MAX_WAITING_TIME_HOURS = 4;

/** Order item fields needed to cascade a state change into inventory. */
type OrderItemRef = { id: Id; orderId: Id; variantId: Id; quantity: Quantity };

/** A line requested by the client, before any validation. */
type OrderItemRequest = { variantId: Id; quantity: Quantity };

/** A cart line that survived product, variant and inventory validation. */
type ResolvedOrderItem = {
  variantId: Id;
  productId: Id;
  vendorId: Id;
  quantity: Quantity;
  price: number;
};

/** A cart line that could not be bought, with the reason to persist on it. */
type RejectedOrderItem = {
  variantId: Id;
  quantity: Quantity;
  reason: OrderItemFailureReason;
};

/** Raw body shared by every create use case, before value objects are built. */
type CreateOrderDto = {
  idempotentKey: string;
  addressId: string;
  waitingTime: Date;
  safeOrder: boolean;
  items: { variantId: string; quantity: number }[];
};

/** Everything a create use case derives from its DTO before touching the DB. */
type CreateOrderInput = {
  orderId: Id;
  idempotentKey: Id;
  addressId: Id;
  actorId: Id;
  waitingTime: ExpirationDate;
  safeOrder: boolean;
  /** `null` derives the type from the vendors of the buyable lines. */
  orderType: OrderTypeVO | null;
  items: OrderItemRequest[];
};

type OrderListQuery = {
  cursor?: string;
  limit?: number;
  direction?: 'next' | 'prev';
};

type InventoryTransition = 'complete' | 'release' | 'restock' | 'soldOut' | 'unsold';

type RetryFailedLinesResult = {
  order: OrderAggregate;
  restored: OrderItemRestoreInput[];
  remaining: RejectedOrderItem[];
  itemEvents: IEvent[];
};

/**
 * Order use cases.
 *
 * Three create paths share one flow: `createMyOrder` (listed items),
 * `buyNow` (one item, type `single`) and `createFromCart` (cart checkout, type
 * `cart`). All of them reserve stock through `IInventoryReservation`, write
 * items through `IOrderItemsWriter`, and save one order aggregate inside a
 * `UnitOfWork.transaction`; item and order events are published only after
 * that transaction commits.
 *
 * An order always names every vendor it buys from in `vendorIds`, so a cart
 * checkout with lines from several vendors is still a single order and a
 * single idempotency key.
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
    private readonly orderItemsQueries: IOrderItemsQueries,
    private readonly unitOfWork: UnitOfWork,
    private readonly vendorQueries: IVendorQueries,
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

  /**
   * Creates an order for the listed items of the authenticated buyer.
   *
   * The order type follows the vendors it ends up spanning: one vendor makes
   * it `single`, several make it `cart` (still one order, one idempotency key).
   *
   * `data.safeOrder` decides what a rejected line does: `true` throws, which
   * rolls back the reservation, the item rows and the order itself; `false`
   * records the line on the order with its failure reason and zero cost.
   */
  async createMyOrder(data: createMyOrderDtoType, actor: AuthActor) {
    const input = this.buildCreateOrderInput(data, Id.create(actor._id));
    const order = await this.placeOrder(input);
    return this.orderCreatedMessage(order, input);
  }

  /** Buys one order item immediately: always type `single`, always one vendor. */
  async buyNow(data: buyNowOrderDtoType, actor: AuthActor) {
    const input = this.buildCreateOrderInput(
      {
        idempotentKey: data.idempotentKey,
        addressId: data.addressId,
        safeOrder: true,
        waitingTime: data.waitingTime,
        items: [{ variantId: data.variantId, quantity: data.quantity }],
      },
      Id.create(actor._id),
      OrderTypeVO.single(),
    );
    const order = await this.placeOrder(input);

    return this.orderCreatedMessage(order, input);
  }

  /**
   * Cross-module entry point used by the cart module.
   *
   * The cart only sends the selected lines; prices, stock and vendors are
   * resolved here. Every selected line becomes part of exactly one order, so
   * `vendorIds` holds every vendor involved and nothing is split per vendor.
   * Checkout is all-or-nothing, so any rejected line aborts the whole order.
   */
  async createFromCart(data: CreateCartOrderInput): Promise<CartOrderResult> {
    const order = await this.placeOrder({
      orderId: Id.create(),
      idempotentKey: data.idempotentKey,
      addressId: data.addressId,
      actorId: data.buyerId,
      waitingTime: data.waitingTime,
      safeOrder: true,
      orderType: OrderTypeVO.cart(),
      items: data.items,
    });

    return {
      orderId: order.id,
      orderType: order.orderType.value,
      vendorIds: order.vendorIds.map((vendorId) => vendorId.value),
      totalPrice: order.totalPrice.value,
      createdAt: order.createdAt.value,
    };
  }

  private buildCreateOrderInput(
    data: CreateOrderDto,
    buyerId: Id,
    orderType: OrderTypeVO | null = null,
  ): CreateOrderInput {
    const waitingTime = ExpirationDate.create(data.waitingTime);
    if (waitingTime.remainingHours > MAX_WAITING_TIME_HOURS) {
      throw new BadRequestError('Waiting time must not be far in the future.');
    }

    return {
      orderId: Id.create(),
      idempotentKey: Id.create(data.idempotentKey),
      addressId: Id.create(data.addressId),
      actorId: buyerId,
      waitingTime,
      safeOrder: data.safeOrder,
      orderType,
      items: data.items.map((item) => ({
        variantId: Id.create(item.variantId),
        quantity: Quantity.create(item.quantity),
      })),
    };
  }

  /**
   * Runs one create use case: address guard, transaction, then events.
   *
   * Publishing after the transaction is deliberate: consumers must never react
   * to an order that rolled back (covered by `order-create-commit.test.ts`).
   */
  private async placeOrder(input: CreateOrderInput): Promise<OrderAggregate> {
    const fullAddress = await this.ensureUsableAddress(input.addressId, input.actorId);

    const { order, itemEvents } = await this.unitOfWork.transaction(() =>
      this.createOrderInTransaction(input, fullAddress),
    );

    await this.publish([...itemEvents, ...order.pullEvents()]);
    return order;
  }

  private orderCreatedMessage(order: OrderAggregate, input: CreateOrderInput) {
    return OrderMessages.orderCreated(
      order.id,
      input.actorId,
      input.addressId,
      OrderMapper.aggregateToResponseReadModel(order),
    );
  }

  /** Address is only a guard, so it is read before the transaction to fail fast. */
  private async ensureUsableAddress(addressId: Id, actorId: Id): Promise<string> {
    const { address, active } = await this.addressQueries.ensureActiveById(addressId, actorId);
    if (!address || !active) throw new BadRequestError('Address not found or inactive.');
    return address.fullAddress;
  }

  private async createOrderInTransaction(
    input: CreateOrderInput,
    fullAddress: string,
  ): Promise<{ order: OrderAggregate; itemEvents: IEvent[] }> {
    await this.orderRepo.EnsureUniqueImpodentKey(input.idempotentKey);
    const { buyable, rejected } = await this.resolveOrderItems(input.items, input.actorId);
    if (buyable.length === 0) throw new BadRequestError('All items in the order were rejected. No order was created.');
    if (input.safeOrder) this.assertAllItemsFulfillable(rejected);
    // Only buyable lines can name a vendor: a rejected line has no product, so
    // it must never add a vendor to the order.
    const vendorIds = this.resolveVendorIds(buyable);
    const order = this.buildOrderAggregate(input, buyable, vendorIds, fullAddress);
    const itemEvents = await this.writeOrderItems(input, buyable, rejected);
    // The aggregate raises `order.created`; events stay buffered until commit.
    order.createOrder();
    await this.orderRepo.Create(order);
    return { order, itemEvents };
  }

  private buildOrderAggregate(
    input: CreateOrderInput,
    items: ResolvedOrderItem[],
    vendorIds: Id[],
    fullAddress: string,
  ): OrderAggregate {
    return OrderAggregate.create({
      id: input.orderId,
      idempotentKey: input.idempotentKey,
      totalPrice: this.calculateTotal(items),
      buyerId: input.actorId,
      vendorIds,
      orderType: input.orderType ?? OrderTypeVO.forVendors(vendorIds.length),
      address: FullAddressVO.create(fullAddress),
    });
  }

  /** Distinct vendors in first-seen order: one entry per vendor, never repeated. */
  private resolveVendorIds(items: ResolvedOrderItem[]): Id[] {
    const vendorIds: Id[] = [];

    for (const item of items) {
      if (!vendorIds.some((vendorId) => vendorId.equals(item.vendorId))) {
        vendorIds.push(item.vendorId);
      }
    }

    return vendorIds;
  }

  private calculateTotal(items: ResolvedOrderItem[]): Money {
    const total = items.reduce((sum, item) => sum + item.quantity.value * item.price, 0);
    return Money.create(total);
  }

  /** Safe order: one rejected line fails the whole order before any write. */
  private assertAllItemsFulfillable(rejected: RejectedOrderItem[]): void {
    if (rejected.length === 0) return;

    const reasons = [...new Set(rejected.map((item) => item.reason))].join(', ');
    throw new BadRequestError(
      `Order rejected: ${rejected.length} item(s) could not be fulfilled (${reasons}).`,
    );
  }

  private async writeOrderItems(
    input: CreateOrderInput,
    buyable: ResolvedOrderItem[],
    rejected: RejectedOrderItem[],
  ): Promise<IEvent[]> {
    const itemEvents = await this.orderItemsWriter.create(
      buyable.map((item) => ({
        id: Id.create(),
        orderId: input.orderId,
        vendorId: item.vendorId,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        waitingTime: input.waitingTime,
        price: Money.create(item.price),
      })),
    );

    if (rejected.length === 0) return itemEvents;

    // Rejected lines are recorded with a reason, never priced or reserved.
    const failureEvents = await this.orderItemsWriter.recordFailures(
      rejected.map((item) => ({
        id: Id.create(),
        orderId: input.orderId,
        variantId: item.variantId,
        quantity: item.quantity,
        waitingTime: input.waitingTime,
        reason: item.reason,
      })),
    );

    return [...itemEvents, ...failureEvents];
  }

  /**
   * Validates the cart and reserves stock, reporting why each line was rejected.
   *
   * The contract queries already return only active, non-deleted variants and
   * non-deleted, non-blocked products, so no extra `validIds` filtering is
   * needed. Every line that does not survive lands in `rejected` with a reason
   * instead of being silently dropped, which is what `safeOrder` needs.
   */
  private async resolveOrderItems(
    items: OrderItemRequest[],
    actorId: Id,
  ): Promise<{ buyable: ResolvedOrderItem[]; rejected: RejectedOrderItem[] }> {
    const { candidates, rejected } = await this.joinItemsWithCatalog(items);
    const reservation = await this.reserveCandidates(candidates, actorId);

    return {
      buyable: reservation.buyable,
      rejected: [...rejected, ...reservation.rejected],
    };
  }

  private async joinItemsWithCatalog(
    items: OrderItemRequest[],
  ): Promise<{ candidates: ResolvedOrderItem[]; rejected: RejectedOrderItem[] }> {
    const variants = await this.variantQueries.verifyAndGet(items.map((item) => item.variantId));
    const products = await this.productQueries.verifyAndGet(
      variants.variantReadModel.map((variant) => Id.create(variant.productId)),
    );

    const variantById = new Map(variants.variantReadModel.map((variant) => [variant.id, variant]));
    const productById = new Map(products.productReadModel.map((product) => [product.id, product]));

    const candidates: ResolvedOrderItem[] = [];
    const rejected: RejectedOrderItem[] = [];

    // A missing entry means the variant or product became unavailable between requests.
    for (const item of items) {
      const variant = variantById.get(item.variantId.value);
      if (!variant) {
        const reason = variants.notFoundIds.some((id) => id.equals(item.variantId))
          ? 'variant_not_found'
          : 'variant_unavailable';
        rejected.push({ variantId: item.variantId, quantity: item.quantity, reason });
        continue;
      }

      const product = productById.get(variant.productId);
      if (!product) {
        rejected.push({
          variantId: item.variantId,
          quantity: item.quantity,
          reason: 'product_unavailable',
        });
        continue;
      }

      candidates.push({
        variantId: item.variantId,
        productId: Id.create(variant.productId),
        vendorId: Id.create(product.vendorId),
        quantity: item.quantity,
        price: variant.price,
      });
    }

    return { candidates, rejected };
  }

  /** Reserves before the order is built so the total only covers held stock. */
  private async reserveCandidates(
    candidates: ResolvedOrderItem[],
    actorId: Id,
  ): Promise<{ buyable: ResolvedOrderItem[]; rejected: RejectedOrderItem[] }> {
    const { lines } = await this.inventoryReservation.reserve(
      candidates.map(({ variantId, quantity }) => ({ variantId, quantity })),
      actorId,
    );
    const lineByVariant = new Map(lines.map((line) => [line.variantId.value, line]));

    const buyable: ResolvedOrderItem[] = [];
    const rejected: RejectedOrderItem[] = [];

    for (const candidate of candidates) {
      const line = lineByVariant.get(candidate.variantId.value);
      if (line?.reserved) {
        buyable.push(candidate);
        continue;
      }

      rejected.push({
        variantId: candidate.variantId,
        quantity: candidate.quantity,
        reason: line?.reason ?? 'inventory_not_found',
      });
    }

    return { buyable, rejected };
  }

  /**
   * Retries every rejected line of the buyer's own order.
   *
   * The rules live in the domain (`Order.ensureOwnedBy`,
   * `OrderStatusVO.ensureItemsRetryable`, and
   * `OrderItemsAggregate.restoreFromFailure` which enforces failed -> pending),
   * so this method only orchestrates them.
   */
  async retryMyOrderItems(id: string, actor: AuthActor) {
    const orderId = Id.create(id);
    const actorId = Id.create(actor._id);

    const { order, restored, remaining, itemEvents } = await this.unitOfWork.transaction(
      async () => {
        const order = await this.orderRepo.FindByIdOrThrow(orderId);

        // Domain permissions: only the buyer may act, and only while the order
        // can still change.
        order.ensureOwnedBy(actorId);
        order.status.ensureItemsRetryable();

        const failed = await this.orderItemsQueries.getFailedByOrderId(orderId);
        if (failed.length === 0) {
          throw new BadRequestError('Order has no failed items to retry.');
        }

        return this.retryFailedLines(order, failed, actorId);
      },
    );

    await this.publish([...itemEvents, ...order.pullEvents()]);
    return this.retriedMessage(order, actorId, restored.length, remaining.length);
  }

  /** Retries one rejected line of the buyer's own order; the rest is untouched. */
  async retryMyOrderItem(itemId: string, actor: AuthActor) {
    const id = Id.create(itemId);
    const actorId = Id.create(actor._id);

    const { order, restored, remaining, itemEvents } = await this.unitOfWork.transaction(
      async () => {
        const failedItem = await this.orderItemsQueries.getFailedById(id);
        if (!failedItem) {
          throw new BadRequestError('Failed order item not found.');
        }

        const order = await this.orderRepo.FindByIdOrThrow(Id.create(failedItem.orderId));
        order.ensureOwnedBy(actorId);
        order.status.ensureItemsRetryable();

        return this.retryFailedLines(order, [failedItem], actorId);
      },
    );

    await this.publish([...itemEvents, ...order.pullEvents()]);
    return this.retriedMessage(order, actorId, restored.length, remaining.length);
  }

  /**
   * Re-resolves the given failed lines, reserves whatever stock is available
   * again, reopens those lines as real items and re-prices the order.
   *
   * Must run inside a transaction: a throw here rolls the reservation and the
   * restored rows back together. Lines that still cannot be bought keep their
   * failure reason and keep costing nothing.
   */
  private async retryFailedLines(
    order: OrderAggregate,
    failed: OrderItemReadModel[],
    actorId: Id,
  ): Promise<RetryFailedLinesResult> {
    const requests = failed.map((item) => ({
      variantId: Id.create(item.variantId),
      quantity: Quantity.create(item.quantity),
    }));
    const { buyable, rejected } = await this.resolveOrderItems(requests, actorId);

    if (buyable.length === 0) {
      return { order, restored: [], remaining: rejected, itemEvents: [] };
    }

    const { quotes, restoredTotals } = this.buildRestoreQuotes(failed, buyable);
    const itemEvents = await this.orderItemsWriter.restoreFailures(quotes);

    // Re-price from every line that is real now: already valid items plus the
    // restored ones. Failed lines never contribute to the total.
    const validItems = await this.orderItemsQueries.getByOrderId(order.id);
    order.applyRecoveredItems(
      [...validItems.map((item) => Money.create(item.totalPrice)), ...restoredTotals],
      actorId,
    );
    await this.orderRepo.Save(order);

    return { order, restored: quotes, remaining: rejected, itemEvents };
  }

  private buildRestoreQuotes(
    failed: OrderItemReadModel[],
    buyable: ResolvedOrderItem[],
  ): { quotes: OrderItemRestoreInput[]; restoredTotals: Money[] } {
    // The same variant can be rejected twice, so quotes are matched per failed
    // row in order rather than by variant alone.
    const failedByVariant = this.groupByVariant(failed);

    const quotes: OrderItemRestoreInput[] = [];
    const restoredTotals: Money[] = [];

    for (const line of buyable) {
      const failedItem = failedByVariant.get(line.variantId.value)?.shift();
      if (!failedItem) continue;

      quotes.push({
        id: Id.create(failedItem._id),
        productId: line.productId,
        vendorId: line.vendorId,
        price: Money.create(line.price),
      });
      restoredTotals.push(Money.create(line.price * line.quantity.value));
    }

    return { quotes, restoredTotals };
  }

  private groupByVariant(items: OrderItemReadModel[]): Map<string, OrderItemReadModel[]> {
    const grouped = new Map<string, OrderItemReadModel[]>();

    for (const item of items) {
      const bucket = grouped.get(item.variantId) ?? [];
      bucket.push(item);
      grouped.set(item.variantId, bucket);
    }

    return grouped;
  }

  private retriedMessage(
    order: OrderAggregate,
    actorId: Id,
    restoredCount: number,
    remainingCount: number,
  ) {
    return OrderMessages.orderItemsRetried(
      order.id,
      actorId,
      restoredCount,
      remainingCount,
      order.totalPrice.value,
      OrderMapper.aggregateToResponseReadModel(order),
    );
  }

  /** Public: the authenticated user's own non-deleted orders. */
  async getMyOrders(query: GetMyOrdersQueryDto, buyerId: string) {
    return this.paginateOrders(
      {
        buyerId: Id.create(buyerId).value,
        'deleted.deleted': false,
      },
      query,
    );
  }

  /** Admin: all orders — optional buyerId / deleted filters, no baseline scope. */
  async findAdminPaginatedOrders(query: GetAdminPaginatedOrdersQueryDto) {
    const filter: FilterQuery<OrderPersistence> = {};
    if (query.buyerId) filter.buyerId = Id.create(query.buyerId).value;
    if (query.deleted !== undefined) filter['deleted.deleted'] = query.deleted;

    return this.paginateOrders(filter, query);
  }

  private async paginateOrders(filter: FilterQuery<OrderPersistence>, query: OrderListQuery) {
    const result = await this.orderRepo.FindPaginated({
      filter,
      cursor: query.cursor ? Id.create(query.cursor) : undefined,
      limit: query.limit ? Quantity.create(query.limit) : undefined,
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

  async cancelMyOrder(id: string, data: orderReasonDtoType, actor: AuthActor) {
    const orderId = Id.create(id);
    const actorId = Id.create(actor._id);
    const reason = Reason.create(data.reason);

    await this.transitionOrder(
      orderId,
      actorId,
      (order) => {
        order.ensureOwnedBy(actorId);
        order.cancelOrder(reason, actorId);
      },
      (items) => this.orderItemsWriter.cancel(items),
      () => 'release',
    );

    return OrderMessages.orderCancelled(orderId, actorId, reason);
  }

  /** Admin: cancel any order, releasing its reserved stock. */
  async cancelAdminOrder(id: string, data: orderReasonDtoType, actor: AuthActor) {
    const orderId = Id.create(id);
    const actorId = Id.create(actor._id);
    const reason = Reason.create(data.reason);

    await this.transitionOrder(
      orderId,
      actorId,
      (order) => order.cancelOrder(reason, actorId),
      (items) => this.orderItemsWriter.cancel(items),
      () => 'release',
    );

    return OrderMessages.orderCancelled(orderId, actorId, reason);
  }

  /**
   * Vendor: own non-deleted orders. `vendorIds` is indexed, so this filters the
   * order rows directly instead of first collecting order ids from every item.
   */
  async findVendorPaginatedOrders(query: GetVendorPaginatedOrdersQueryDto, actor: AuthActor) {
    const vendorId = await this.resolveVendorId(Id.create(actor._id));

    const filter: FilterQuery<OrderPersistence> = {
      vendorIds: vendorId.value,
      'deleted.deleted': false,
    };
    if (query.status) filter.status = query.status;

    return this.paginateOrders(filter, query);
  }

  /** Vendor: one order they contribute to, with only their own item lines. */
  async getVendorOrderById(id: string, actor: AuthActor) {
    const orderId = Id.create(id);
    const vendorId = await this.resolveVendorId(Id.create(actor._id));
    const order = await this.orderRepo.FindByIdOrThrow(orderId);
    if (order.delete.isDeleted) throw new NotFoundError('Order not found.');

    // The order lists its vendors, so membership is checked without reading items.
    if (!order.hasVendor(vendorId)) {
      throw new ForbiddenError('This order does not contain your items.');
    }

    const items = await this.orderItemsQueries.getByOrderId(orderId);

    return {
      order: OrderMapper.aggregateToResponseReadModel(order),
      items: items.filter((item) => item.vendorId === vendorId.value),
    };
  }

  async confirmOrder(id: string, actor: AuthActor) {
    const orderId = Id.create(id);
    const actorId = Id.create(actor._id);
    await this.resolveVendorId(actorId);
    await this.transitionOrder(
      orderId,
      actorId,
      (order) => order.confirmOrder(actorId),
      (items) => this.orderItemsWriter.confirm(items),
      () => null, // inventory is already held, so no transition is needed
    );

    return OrderMessages.orderConfirmed(orderId, actorId);
  }

  async completeOrder(id: string, actor: AuthActor) {
    const orderId = Id.create(id);
    const actorId = Id.create(actor._id);
    await this.resolveVendorId(actorId);
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
      (order) => 'unsold',
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
      () => 'unsold',
    );

    return OrderMessages.orderRefunded(orderId, actorId, reason);
  }

  async updateOrder(id: string, data: updateOrderDtoType, actor: AuthActor) {
    const orderId = Id.create(id);
    const actorId = Id.create(actor._id);
    const order = await this.orderRepo.FindByIdOrThrow(orderId);

    order.updateOrder(Money.create(data.totalPrice), FullAddressVO.create(data.address), actorId);
    await this.saveAndPublish(order);

    return OrderMessages.orderUpdated(orderId, actorId);
  }

  async deleteOrder(id: string, data: orderReasonDtoType, actor: AuthActor) {
    const orderId = Id.create(id);
    const actorId = Id.create(actor._id);
    const reason = Reason.create(data.reason);
    const order = await this.orderRepo.FindByIdOrThrow(orderId);

    order.deleteOrder(reason, actorId);
    await this.saveAndPublish(order);

    return OrderMessages.orderDeleted(orderId, actorId, reason);
  }

  async recoverOrder(id: string, actor: AuthActor) {
    const orderId = Id.create(id);
    const actorId = Id.create(actor._id);
    const order = await this.orderRepo.FindByIdOrThrow(orderId);

    order.recoverOrder(actorId);
    await this.saveAndPublish(order);

    return OrderMessages.orderRecovered(orderId, actorId);
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

    const lines = items.map(({ variantId, quantity }) => ({ variantId, quantity }));

    switch (action) {
      case 'complete':
        await this.inventoryReservation.complete(lines, actorId);
        break;
      case 'release':
        await this.inventoryReservation.release(lines, actorId);
        break;
      case 'restock':
        await this.inventoryReservation.restock(lines, actorId);
        break;
      case 'soldOut':
        await this.inventoryReservation.soldOut(lines, actorId);
        break;
      case 'unsold':
        await this.inventoryReservation.unsold(lines, actorId);
        break;
    }
  }

  private async saveAndPublish(order: OrderAggregate): Promise<void> {
    await this.orderRepo.Save(order);
    await this.publish(order.pullEvents());
  }

  private async publish(events: IEvent[]): Promise<void> {
    if (events.length > 0) await this.eventBus.publish(events);
  }
}
