import type {
  AuthActor,
  IInventoryReservation,
  IOrderItemsQueries,
  IOrderItemsWriter,
  IOrderQueries,
  IOrderWriter,
  IVendorQueries,
} from '@ecomerece/contracts';
import {
  Id,
  type IEvent,
  type IEventBus,
  type IImageStoragePort,
  ImageKey,
  ImageSource,
  OrderRequestAggregate,
  OrderRequestImageVO,
  type OrderRequestReadModel,
  OrderRequestTypeVO,
  Quantity,
  Reason,
  UrlVO,
} from '@ecomerece/domain';
import type {
  AcceptOrderRequestDto,
  CreateOrderRequestDto,
  GetAdminOrderRequestsQueryDto,
  GetMyOrderRequestsQueryDto,
  GetVendorOrderRequestsQueryDto,
  RejectOrderRequestDto,
} from '@ecomerece/shared';
import type { FilterQuery } from 'mongoose';
import type { UnitOfWork } from '../../../core/database/unit-of-work';
import { BaseService } from '../../../core/services/base.services';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../../errors/app-error';
import { OrderRequestMapper } from '../infrastructure/order-request.mapper';
import type { OrderRequestPersistence } from '../infrastructure/order-request.model';
import type { OrderRequestRepository } from '../infrastructure/order-request.repository';
import {
  OrderRequestMessages,
  type OrderRequestMessagesType,
} from '../presentation/order-request.messages';

type ActorMode = 'vendor' | 'admin';

/**
 * Buyer return/refund requests.
 *
 * Buyers create requests for an order or one of its lines. Vendors may act only
 * on requests belonging to their own vendor; admins bypass that ownership check.
 * Accepting a request cascades to the order/order-items modules and returns the
 * sold-out stock to available inventory.
 */
export class OrderRequestApplicationService extends BaseService {
  constructor(
    private readonly requestRepo: OrderRequestRepository,
    private readonly orderQueries: IOrderQueries,
    private readonly orderItemsQueries: IOrderItemsQueries,
    private readonly orderItemsWriter: IOrderItemsWriter,
    private readonly orderWriter: IOrderWriter,
    private readonly inventoryReservation: IInventoryReservation,
    private readonly vendorQueries: IVendorQueries,
    private readonly imageStorage: IImageStoragePort,
    private readonly eventBus: IEventBus,
    private readonly unitOfWork: UnitOfWork,
  ) {
    super();
  }

  private isDataUri(value: string): boolean {
    return value.startsWith('data:image/');
  }

  private decodeDataUri(value: string): { contentType: string; bytes: Uint8Array } {
    const separator = value.indexOf(',');
    const header = value.slice(5, separator);
    return {
      contentType: header.split(';')[0],
      bytes: Buffer.from(value.slice(separator + 1), 'base64'),
    };
  }

  private async storeImages(
    values: string[] | undefined,
  ): Promise<{ images: OrderRequestImageVO[]; keys: string[] }> {
    const images: OrderRequestImageVO[] = [];
    const keys: string[] = [];

    try {
      for (const value of values ?? []) {
        if (!this.isDataUri(value)) {
          images.push(OrderRequestImageVO.create(UrlVO.create(value)));
          continue;
        }

        const { contentType, bytes } = this.decodeDataUri(value);
        const stored = await this.imageStorage.upload(ImageSource.fromBytes(bytes, contentType), {
          folder: 'order-requests',
          access: 'public',
        });
        keys.push(stored.key.value);
        images.push(OrderRequestImageVO.create(UrlVO.create(stored.publicUrl), stored.key.value));
      }
      return { images, keys };
    } catch (error) {
      await this.cleanupImages(keys);
      throw error;
    }
  }

  /** Best-effort cleanup — a failed delete must never hide the original error. */
  private async cleanupImages(keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    await Promise.all(
      keys.map(async (key) => {
        try {
          await this.imageStorage.delete(ImageKey.rehydrate(key));
        } catch (error) {
          console.error(
            `[order-request] failed to clean up stored image '${key}':`,
            error instanceof Error ? error.message : error,
          );
        }
      }),
    );
  }

  private async publishEvents(events: IEvent[]): Promise<void> {
    if (events.length === 0) return;
    await this.unitOfWork.deferAfterCommit(() => this.eventBus.publish(events));
  }

  private async resolveVendorId(actorId: Id): Promise<Id> {
    const vendor = await this.vendorQueries.ensureActiveByUserId(actorId);
    if (!vendor.vendor || !vendor.active) {
      throw new ForbiddenError('You do not own an active vendor.');
    }
    return Id.create(vendor.vendor.id);
  }

  private async ensureActiveOrder(orderId: Id) {
    const result = await this.orderQueries.ensureActiveById(orderId);
    if (!result.order || !result.active) throw new NotFoundError('Order not found.');
    return result.order;
  }

  private isReturnable(status: string): boolean {
    return status === 'confirmed' || status === 'completed';
  }

  private isRefundable(status: string): boolean {
    return status === 'confirmed' || status === 'completed' || status === 'returned';
  }

  private assertRequestable(status: string, type: OrderRequestTypeVO): void {
    const allowed = type.isReturn ? this.isReturnable(status) : this.isRefundable(status);
    if (!allowed) {
      throw new BadRequestError(`A ${type.value} request is not allowed for a ${status} order.`);
    }
  }

  /** Resolves the target vendor/status without trusting a client-supplied vendor id. */
  private async resolveRequestTarget(
    order: { vendorIds: string[]; status: string },
    orderId: Id,
    orderItemId: Id | null,
  ): Promise<{ vendorId: Id; status: string }> {
    if (orderItemId) {
      const items = await this.orderItemsQueries.getByOrderId(orderId);
      const item = items.find((candidate) => candidate._id === orderItemId.value);
      if (!item) throw new NotFoundError('Order item not found.');
      if (!item.vendorId) throw new BadRequestError('This order item has no vendor.');
      return { vendorId: Id.create(item.vendorId), status: item.status };
    }

    if (order.vendorIds.length !== 1) {
      throw new BadRequestError('Select an order item for a multi-vendor order.');
    }
    return { vendorId: Id.create(order.vendorIds[0]), status: order.status };
  }

  async createMyOrderRequest(
    data: CreateOrderRequestDto,
    actor: AuthActor,
  ): Promise<OrderRequestMessagesType> {
    const actorId = Id.create(actor._id);
    const orderId = Id.create(data.orderId);
    const orderItemId = data.orderItemId ? Id.create(data.orderItemId) : null;
    const type = OrderRequestTypeVO.create(data.type);
    const reason = Reason.create(data.reason);

    const order = await this.ensureActiveOrder(orderId);
    if (order.buyerId !== actorId.value) {
      throw new ForbiddenError('You do not own this order.');
    }

    const target = await this.resolveRequestTarget(order, orderId, orderItemId);
    this.assertRequestable(target.status, type);

    const { images, keys } = await this.storeImages(data.images);
    const requestId = Id.create();
    const request = OrderRequestAggregate.create({
      id: requestId,
      orderId,
      orderItemId,
      vendorId: target.vendorId,
      buyerId: actorId,
      type,
      reason,
      note: data.note ?? null,
      images,
    });

    try {
      await this.requestRepo.Create(request);
    } catch (error) {
      await this.cleanupImages(keys);
      throw error;
    }

    await this.publishEvents(request.pullEvents());
    return OrderRequestMessages.created(
      requestId,
      actorId,
      OrderRequestMapper.aggregateToReadModel(request),
    );
  }

  async findMyOrderRequests(query: GetMyOrderRequestsQueryDto, actor: AuthActor) {
    const filter: FilterQuery<OrderRequestPersistence> = {
      buyerId: Id.create(actor._id).value,
    };
    if (query.orderId) filter.orderId = Id.create(query.orderId).value;
    if (query.status) filter.status = query.status;
    if (query.type) filter.type = query.type;

    return this.paginate(query, filter);
  }

  async getMyOrderRequestById(id: string, actor: AuthActor): Promise<OrderRequestReadModel> {
    const request = await this.requestRepo.FindByIdOrThrow(Id.create(id));
    if (request.buyerId.value !== actor._id) {
      throw new ForbiddenError('You do not own this order request.');
    }
    return OrderRequestMapper.aggregateToReadModel(request);
  }

  async cancelMyOrderRequest(id: string, actor: AuthActor): Promise<OrderRequestMessagesType> {
    const requestId = Id.create(id);
    const actorId = Id.create(actor._id);
    const request = await this.requestRepo.FindByIdOrThrow(requestId);

    request.cancel(actorId);
    await this.requestRepo.Save(request);
    await this.publishEvents(request.pullEvents());

    return OrderRequestMessages.cancelled(
      requestId,
      actorId,
      OrderRequestMapper.aggregateToReadModel(request),
    );
  }

  async findVendorOrderRequests(query: GetVendorOrderRequestsQueryDto, actor: AuthActor) {
    const vendorId = await this.resolveVendorId(Id.create(actor._id));
    const filter: FilterQuery<OrderRequestPersistence> = { vendorId: vendorId.value };
    if (query.orderId) filter.orderId = Id.create(query.orderId).value;
    if (query.status) filter.status = query.status;
    if (query.type) filter.type = query.type;

    return this.paginate(query, filter);
  }

  async getVendorOrderRequestById(id: string, actor: AuthActor): Promise<OrderRequestReadModel> {
    const vendorId = await this.resolveVendorId(Id.create(actor._id));
    const request = await this.requestRepo.FindByIdOrThrow(Id.create(id));
    this.assertVendorOwnsRequest(request, vendorId);
    return OrderRequestMapper.aggregateToReadModel(request);
  }

  async acceptVendorOrderRequest(
    id: string,
    data: AcceptOrderRequestDto,
    actor: AuthActor,
  ): Promise<OrderRequestMessagesType> {
    return this.acceptRequest(id, actor, data.note ?? null, 'vendor');
  }

  async rejectVendorOrderRequest(
    id: string,
    data: RejectOrderRequestDto,
    actor: AuthActor,
  ): Promise<OrderRequestMessagesType> {
    return this.rejectRequest(id, actor, data.reason, 'vendor');
  }

  async findAdminOrderRequests(query: GetAdminOrderRequestsQueryDto) {
    const filter: FilterQuery<OrderRequestPersistence> = {};
    if (query.orderId) filter.orderId = Id.create(query.orderId).value;
    if (query.orderItemId) filter.orderItemId = Id.create(query.orderItemId).value;
    if (query.buyerId) filter.buyerId = Id.create(query.buyerId).value;
    if (query.vendorId) filter.vendorId = Id.create(query.vendorId).value;
    if (query.status) filter.status = query.status;
    if (query.type) filter.type = query.type;

    return this.paginate(query, filter);
  }

  async getAdminOrderRequestById(id: string): Promise<OrderRequestReadModel> {
    const request = await this.requestRepo.FindByIdOrThrow(Id.create(id));
    return OrderRequestMapper.aggregateToReadModel(request);
  }

  async acceptAdminOrderRequest(
    id: string,
    data: AcceptOrderRequestDto,
    actor: AuthActor,
  ): Promise<OrderRequestMessagesType> {
    return this.acceptRequest(id, actor, data.note ?? null, 'admin');
  }

  async rejectAdminOrderRequest(
    id: string,
    data: RejectOrderRequestDto,
    actor: AuthActor,
  ): Promise<OrderRequestMessagesType> {
    return this.rejectRequest(id, actor, data.reason, 'admin');
  }

  async cancelAdminOrderRequest(id: string, actor: AuthActor): Promise<OrderRequestMessagesType> {
    const requestId = Id.create(id);
    const actorId = Id.create(actor._id);
    const request = await this.requestRepo.FindByIdOrThrow(requestId);

    request.cancelByAdmin(actorId);
    await this.requestRepo.Save(request);
    await this.publishEvents(request.pullEvents());

    return OrderRequestMessages.cancelled(
      requestId,
      actorId,
      OrderRequestMapper.aggregateToReadModel(request),
    );
  }

  private async paginate(
    query: { cursor?: string; limit: number; direction?: 'next' | 'prev' },
    filter: FilterQuery<OrderRequestPersistence>,
  ) {
    const cursor = query.cursor ? Id.create(query.cursor) : undefined;
    const limit = Quantity.create(query.limit);
    const result = await this.requestRepo.FindPaginated({
      filter,
      cursor,
      limit,
      direction: query.direction,
    });

    return {
      data: result.data.map((request) => OrderRequestMapper.aggregateToReadModel(request)),
      meta: result.meta,
    };
  }

  private assertVendorOwnsRequest(request: OrderRequestAggregate, vendorId: Id): void {
    if (request.vendorId.value !== vendorId.value) {
      throw new ForbiddenError('This order request does not belong to your vendor.');
    }
  }

  private async acceptRequest(
    id: string,
    actor: AuthActor,
    note: string | null,
    mode: ActorMode,
  ): Promise<OrderRequestMessagesType> {
    const requestId = Id.create(id);
    const actorId = Id.create(actor._id);

    const { request, events } = await this.unitOfWork.transaction(async () => {
      const request = await this.requestRepo.FindByIdOrThrow(requestId);
      if (mode === 'vendor') {
        this.assertVendorOwnsRequest(request, await this.resolveVendorId(actorId));
      }

      request.accept(actorId, note);
      const cascadeEvents = await this.cascadeAccept(request, actor, mode);
      await this.requestRepo.Save(request);
      return { request, events: [...cascadeEvents, ...request.pullEvents()] };
    });

    await this.publishEvents(events);
    return OrderRequestMessages.accepted(
      requestId,
      actorId,
      OrderRequestMapper.aggregateToReadModel(request),
    );
  }

  private async rejectRequest(
    id: string,
    actor: AuthActor,
    reason: string,
    mode: ActorMode,
  ): Promise<OrderRequestMessagesType> {
    const requestId = Id.create(id);
    const actorId = Id.create(actor._id);

    const { request, events } = await this.unitOfWork.transaction(async () => {
      const request = await this.requestRepo.FindByIdOrThrow(requestId);
      if (mode === 'vendor') {
        this.assertVendorOwnsRequest(request, await this.resolveVendorId(actorId));
      }

      request.reject(actorId, Reason.create(reason));
      await this.requestRepo.Save(request);
      return { request, events: request.pullEvents() };
    });

    await this.publishEvents(events);
    return OrderRequestMessages.rejected(
      requestId,
      actorId,
      OrderRequestMapper.aggregateToReadModel(request),
    );
  }

  /** Applies the accepted request to its single line, or to the whole order. */
  private async cascadeAccept(
    request: OrderRequestAggregate,
    actor: AuthActor,
    mode: ActorMode,
  ): Promise<IEvent[]> {
    const actorId = Id.create(actor._id);

    const orderItemId = request.orderItemId;
    if (orderItemId) {
      const items = await this.orderItemsQueries.getByOrderId(request.orderId);
      const item = items.find((candidate) => candidate._id === orderItemId.value);
      if (!item) throw new NotFoundError('Order item not found.');

      const itemEvents = request.type.isReturn
        ? await this.orderItemsWriter.returnItems([{ id: orderItemId }])
        : await this.orderItemsWriter.refund([{ id: orderItemId }]);

      // A return already returned the units; refunding it must not do so twice.
      if (request.type.isReturn || item.status !== 'returned') {
        await this.inventoryReservation.unsold(
          [{ variantId: Id.create(item.variantId), quantity: Quantity.create(item.quantity) }],
          actorId,
        );
      }
      return itemEvents;
    }

    if (request.type.isReturn) {
      if (mode === 'admin') {
        await this.orderWriter.returnOrderAsAdmin(request.orderId, request.reason, actor);
      } else {
        await this.orderWriter.returnOrder(request.orderId, request.reason, actor);
      }
    } else if (mode === 'admin') {
      await this.orderWriter.refundOrderAsAdmin(request.orderId, request.reason, actor);
    } else {
      await this.orderWriter.refundOrder(request.orderId, request.reason, actor);
    }

    return [];
  }
}
