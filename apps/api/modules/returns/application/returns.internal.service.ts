import type {
  EnsureActiveReturnResult,
  IOrderItemsQueries,
  IOrderQueries,
} from '@ecomerece/contracts';
import type { Id, OrderItemReadModel, OrderReadModel, ReturnReadModel } from '@ecomerece/domain';
import { NotFoundError } from '../../../errors/app-error';
import { ReturnMapper } from '../infrastructure/return.mapper';
import type { ReturnRepository } from '../infrastructure/return.repository';

/** Statuses that no longer hold units against a later return request. */
const CLOSED_RETURN_STATUSES = new Set(['rejected', 'cancelled']);

export class ReturnsInternalService {
  constructor(
    private readonly returnRepo: ReturnRepository,
    private readonly orderQueries: IOrderQueries,
    private readonly orderItemsQueries: IOrderItemsQueries,
  ) {}

  async getReturnById(returnId: Id): Promise<ReturnReadModel | null> {
    const request = await this.returnRepo.FindById(returnId);
    return request ? ReturnMapper.aggregateToReadModel(request) : null;
  }

  async ensureActiveReturnById(returnId: Id): Promise<EnsureActiveReturnResult> {
    const returnRequest = await this.getReturnById(returnId);

    if (!returnRequest || returnRequest.deleted.deleted) {
      return { returnRequest: null, active: false };
    }

    return { returnRequest, active: true };
  }

  async getReturnsByOrderId(orderId: Id): Promise<ReturnReadModel[]> {
    const requests = await this.returnRepo.FindByOrderId(orderId);
    return requests.map(ReturnMapper.aggregateToReadModel);
  }

  async getActiveOrderOrThrow(orderId: Id): Promise<OrderReadModel> {
    const result = await this.orderQueries.ensureActiveById(orderId);

    if (!result.order || !result.active) {
      throw new NotFoundError('Order not found or no longer active.');
    }

    return result.order;
  }

  /** Order lines are read through the order-items contract, never its storage. */
  async getOrderItemOrThrow(orderId: Id, orderItemId: Id): Promise<OrderItemReadModel> {
    const items = await this.orderItemsQueries.getByOrderId(orderId);
    const item = items.find((candidate) => candidate._id === orderItemId.value);

    if (!item) throw new NotFoundError('Order item does not belong to this order.');

    return item;
  }

  /** Units already out on a live return request, so they cannot be requested twice. */
  async getPendingQuantityForOrderItem(orderItemId: Id): Promise<number> {
    const requests = await this.returnRepo.FindByOrderItemId(orderItemId);

    return requests
      .filter((request) => !CLOSED_RETURN_STATUSES.has(request.status.status))
      .reduce((total, request) => total + request.quantity.value, 0);
  }
}
