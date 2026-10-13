import type { OrderReadModel } from '@ecomerece/domain';
import type { OrderInternalService } from '../order.internal.service';
import type { EnsureActiveOrderGetByIdQuery } from '../queries/ensure-active-order-get-by-id.query';

export class EnsureActiveOrderGetByIdHandler {
  readonly type = 'EnsureActiveOrderGetByIdQuery';
  constructor(private readonly internalService: OrderInternalService) {}
  async handle(
    query: EnsureActiveOrderGetByIdQuery,
  ): Promise<{ order: OrderReadModel | null; active: boolean }> {
    return await this.internalService.ensureActiveOrderGetById(query.payload.orderId);
  }
}
