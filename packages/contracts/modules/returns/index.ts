import type { Id, ReturnReadModel } from '@ecomerece/domain';

export interface EnsureActiveReturnResult {
  returnRequest: ReturnReadModel | null;
  active: boolean;
}

/**
 * Cross-module read port implemented by the returns module.
 *
 * Payments (when it lands) and the order read path can ask what is pending
 * return without importing returns' aggregates or persistence.
 */
export interface IReturnQueries {
  ensureActiveById(returnId: Id): Promise<EnsureActiveReturnResult>;
  getByOrderId(orderId: Id): Promise<ReturnReadModel[]>;
  /** Units already requested back for one order line, excluding cancelled ones. */
  getPendingQuantityForOrderItem(orderItemId: Id): Promise<number>;
}
