import type { AuthActor } from '@ecomerece/contracts';
import type { IEventBus } from '@ecomerece/domain/events/event-bus.interface';
import { ReturnRequestAggregate } from '@ecomerece/domain';
import { ReturnTypeVO } from '@ecomerece/domain/modules/returns/value-objects/return-type.vo';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import { Reason } from '@ecomerece/domain/value-objects/reason.vo';
import type {
  createReturnDtoType,
  GetAdminReturnsQueryDto,
  GetMyReturnsQueryDto,
  GetVendorReturnsQueryDto,
  ReturnListItemResponseReadModel,
} from '@ecomerece/shared';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../../errors/app-error';
import { ReturnMapper } from '../infrastructure/return.mapper';
import type { ReturnRepository } from '../infrastructure/return.repository';
import { ReturnMessages } from '../presentation/returns.messages';
import type { ReturnsInternalService } from './returns.internal.service';

export type ReturnScope = {
  actorId: Id;
  vendorId: Id | null;
};

export type ReturnListResult = {
  data: ReturnListItemResponseReadModel[];
  meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
};

type ReturnPageDto = Pick<
  GetMyReturnsQueryDto | GetVendorReturnsQueryDto | GetAdminReturnsQueryDto,
  'cursor' | 'limit' | 'direction'
>;

/** Only a line that was actually delivered can come back. */
const RETURNABLE_ITEM_STATUS = 'completed';

export class ReturnsApplicationService {
  constructor(
    private readonly returnRepo: ReturnRepository,
    private readonly internalService: ReturnsInternalService,
    private readonly eventBus: IEventBus,
  ) {}

  // ── Buyer ──────────────────────────────────────────────────────────────────

  async createReturn(data: createReturnDtoType, actor: AuthActor) {
    const orderId = Id.create(data.orderId);
    const order = await this.internalService.getActiveOrderOrThrow(orderId);

    if (order.buyerId !== actor._id) {
      throw new ForbiddenError('Only the buyer of an order can request a return.');
    }

    const orderItemId = Id.create(data.orderItemId);
    const item = await this.internalService.getOrderItemOrThrow(orderId, orderItemId);

    if (!item.vendorId) {
      throw new BadRequestError('This order line was never fulfilled, so it cannot be returned.');
    }
    if (item.status !== RETURNABLE_ITEM_STATUS) {
      throw new BadRequestError('Only a completed order line can be returned.');
    }

    const quantity = Quantity.create(data.quantity);
    if (quantity.value > item.quantity) {
      throw new BadRequestError('The return quantity exceeds the ordered quantity.');
    }

    const pendingQuantity = await this.internalService.getPendingQuantityForOrderItem(orderItemId);
    if (pendingQuantity + quantity.value > item.quantity) {
      throw new BadRequestError(
        `Only ${item.quantity - pendingQuantity} unit(s) of this line are still returnable.`,
      );
    }

    const request = ReturnRequestAggregate.create({
      id: Id.create(),
      orderId,
      orderItemId,
      vendorId: Id.create(item.vendorId),
      buyerId: Id.create(order.buyerId),
      quantity,
      returnType: ReturnTypeVO.create(data.returnType),
      reason: Reason.create(data.reason),
    });

    request.requestReturn();
    await this.returnRepo.Create(request);
    await this.eventBus.publish(request.pullEvents());

    return ReturnMessages.created(request);
  }

  getMyReturns(page: GetMyReturnsQueryDto, actor: AuthActor): Promise<ReturnListResult> {
    return this.list({ buyerId: actor._id, orderId: page.orderId, status: page.status }, page);
  }

  async getMyReturnById(returnId: Id, actor: AuthActor) {
    const request = await this.loadActive(returnId);

    if (!request.isOwnedByBuyer(Id.create(actor._id))) {
      throw new ForbiddenError('You do not own this return request.');
    }

    return ReturnMapper.aggregateToResponseReadModel(request);
  }

  async cancelMyReturn(returnId: Id, reason: Reason, actorId: Id) {
    const request = await this.loadActive(returnId);

    if (!request.isOwnedByBuyer(actorId)) {
      throw new ForbiddenError('You do not own this return request.');
    }

    request.cancel(reason, actorId);
    return this.save(request, 'cancelled');
  }

  // ── Vendor ─────────────────────────────────────────────────────────────────

  getVendorReturns(page: GetVendorReturnsQueryDto, vendorId: Id): Promise<ReturnListResult> {
    return this.list(
      { vendorId: vendorId.value, orderId: page.orderId, status: page.status },
      page,
    );
  }

  async getVendorReturnById(returnId: Id, vendorId: Id) {
    const request = await this.loadForScope(returnId, { actorId: vendorId, vendorId });
    return ReturnMapper.aggregateToResponseReadModel(request);
  }

  // ── Admin ──────────────────────────────────────────────────────────────────

  getAdminReturns(page: GetAdminReturnsQueryDto): Promise<ReturnListResult> {
    return this.list(
      {
        orderId: page.orderId,
        orderItemId: page.orderItemId,
        vendorId: page.vendorId,
        buyerId: page.buyerId,
        status: page.status,
        deleted: page.deleted ?? false,
      },
      page,
    );
  }

  async getAdminReturnById(returnId: Id) {
    const request = await this.loadIncludingDeleted(returnId);
    return ReturnMapper.aggregateToResponseReadModel(request);
  }

  // ── Decisions and goods movements ──────────────────────────────────────────

  async approveReturn(returnId: Id, scope: ReturnScope) {
    const request = await this.loadForScope(returnId, scope);
    request.approve(scope.actorId);
    return this.save(request, 'approved');
  }

  async rejectReturn(returnId: Id, reason: Reason, scope: ReturnScope) {
    const request = await this.loadForScope(returnId, scope);
    request.reject(reason, scope.actorId);
    return this.save(request, 'rejected');
  }

  async markReturnShippedBack(returnId: Id, scope: ReturnScope) {
    const request = await this.loadForScope(returnId, scope);
    request.markShippedBack(scope.actorId);
    return this.save(request, 'shipped back');
  }

  async markReturnReceived(returnId: Id, scope: ReturnScope) {
    const request = await this.loadForScope(returnId, scope);
    request.markReceived(scope.actorId);
    return this.save(request, 'received');
  }

  async cancelReturn(returnId: Id, reason: Reason, scope: ReturnScope) {
    const request = await this.loadForScope(returnId, scope);
    request.cancel(reason, scope.actorId);
    return this.save(request, 'cancelled');
  }

  async deleteReturn(returnId: Id, reason: Reason, scope: ReturnScope) {
    const request = await this.loadIncludingDeleted(returnId);
    request.deleteRequest(reason, scope.actorId);

    await this.returnRepo.Save(request);
    await this.eventBus.publish(request.pullEvents());

    return ReturnMessages.deleted(request, reason);
  }

  async recoverReturn(returnId: Id) {
    const request = await this.loadIncludingDeleted(returnId);
    request.recoverRequest();

    await this.returnRepo.Save(request);
    await this.eventBus.publish(request.pullEvents());

    return ReturnMessages.recovered(request);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private async save(request: ReturnRequestAggregate, action: string) {
    await this.returnRepo.Save(request);
    await this.eventBus.publish(request.pullEvents());
    return ReturnMessages.updated(request, action);
  }

  private async list(
    filter: {
      orderId?: string;
      orderItemId?: string;
      vendorId?: string;
      buyerId?: string;
      status?: string;
      deleted?: boolean;
    },
    page: ReturnPageDto,
  ): Promise<ReturnListResult> {
    const result = await this.returnRepo.FindPaginated({
      filter,
      cursor: page.cursor ? Id.create(page.cursor) : undefined,
      limit: Quantity.create(page.limit),
      direction: page.direction,
    });

    return {
      data: result.data.map(ReturnMapper.aggregateToListItemReadModel),
      meta: result.meta,
    };
  }

  private async loadActive(returnId: Id): Promise<ReturnRequestAggregate> {
    const request = await this.returnRepo.FindById(returnId);

    if (!request || request.delete.isDeleted) {
      throw new NotFoundError('Return request not found.');
    }

    return request;
  }

  private async loadIncludingDeleted(returnId: Id): Promise<ReturnRequestAggregate> {
    const request = await this.returnRepo.FindById(returnId);

    if (!request) throw new NotFoundError('Return request not found.');

    return request;
  }

  private async loadForScope(returnId: Id, scope: ReturnScope): Promise<ReturnRequestAggregate> {
    const request = await this.loadActive(returnId);

    // Admin scope carries no vendor id and may act on any vendor's request.
    if (scope.vendorId) request.ensureOwnedByVendor(scope.vendorId);

    return request;
  }
}
