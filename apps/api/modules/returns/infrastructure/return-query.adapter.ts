import type { EnsureActiveReturnResult, IReturnQueries } from '@ecomerece/contracts';
import type { Id, ReturnReadModel } from '@ecomerece/domain';
import type { ReturnsInternalService } from '../application/returns.internal.service';

export class ReturnQueryAdapter implements IReturnQueries {
  constructor(private readonly internalService: ReturnsInternalService) {}

  ensureActiveById(returnId: Id): Promise<EnsureActiveReturnResult> {
    return this.internalService.ensureActiveReturnById(returnId);
  }

  getByOrderId(orderId: Id): Promise<ReturnReadModel[]> {
    return this.internalService.getReturnsByOrderId(orderId);
  }

  getPendingQuantityForOrderItem(orderItemId: Id): Promise<number> {
    return this.internalService.getPendingQuantityForOrderItem(orderItemId);
  }
}
