import type { Id, OrderReadModel } from '@ecomerece/domain';

/** Result of checking an order exists and may be used. */
export interface EnsureActiveOrderResult {
  order: OrderReadModel | null;
  active: boolean;
}

/** Cross-module read port implemented by the order module. */
export interface IOrderQueries {
  ensureActiveById(orderId: Id): Promise<EnsureActiveOrderResult>;
}
