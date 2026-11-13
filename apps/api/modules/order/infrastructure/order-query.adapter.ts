import type { EnsureActiveOrderResult, IOrderQueries } from '@ecomerece/contracts';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { OrderInternalService } from '../application/order.internal.service';

/** Contract-facing adapter for order reads. */
export class OrderQueryAdapter implements IOrderQueries {
  constructor(private readonly internalService: OrderInternalService) {}

  ensureActiveById(orderId: Id): Promise<EnsureActiveOrderResult> {
    return this.internalService.ensureActiveOrderGetById(orderId);
  }
}
