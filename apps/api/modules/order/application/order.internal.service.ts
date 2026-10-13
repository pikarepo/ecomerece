import type { Id, OrderReadModel } from '@ecomerece/domain';
import { BaseService } from '../../../core/services/base.services';
import { OrderMapper } from '../infrastructure/order.mapper';
import type { OrderRepository } from '../infrastructure/order.repository';

export class OrderInternalService extends BaseService {
  constructor(private readonly orderRepo: OrderRepository) {
    super();
  }

  async ensureActiveOrderGetById(
    orderId: Id,
  ): Promise<{ order: OrderReadModel | null; active: boolean }> {
    const order = await this.orderRepo.FindById(orderId);
    if (!order) return { order: null, active: false };
    const orderDoc = OrderMapper.aggregateToReadModel(order);
    if (orderDoc.deleted.deleted) return { order: orderDoc, active: false };
    return { order: orderDoc, active: true };
  }
}
