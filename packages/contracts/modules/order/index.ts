import type { Id, OrderReadModel } from '@ecomerece/domain';
import type { ExpirationDate } from '@ecomerece/domain/value-objects/expiration-date.vo';
import type { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import type { Reason } from '@ecomerece/domain/value-objects/reason.vo';
import type { AuthActor } from '../user';

/** Result of checking an order exists and may be used. */
export interface EnsureActiveOrderResult {
  order: OrderReadModel | null;
  active: boolean;
}

/** Cross-module read port implemented by the order module. */
export interface IOrderQueries {
  ensureActiveById(orderId: Id): Promise<EnsureActiveOrderResult>;
}

export interface CartOrderLineInput {
  variantId: Id;
  quantity: Quantity;
}

/**
 * Checkout hand-off: the cart module owns the selection, the order module owns
 * pricing, stock and the vendors. One call creates exactly one order covering
 * every line, even when those lines come from several vendors.
 */
export interface CreateCartOrderInput {
  /** One key for the whole checkout, so a retry cannot create a second order. */
  idempotentKey: Id;
  buyerId: Id;
  addressId: Id;
  waitingTime: ExpirationDate;
  items: CartOrderLineInput[];
}

/** The single order created for a cart checkout. */
export interface CartOrderResult {
  orderId: Id;
  orderType: string;
  /** Distinct vendors the order buys from, one entry per vendor. */
  vendorIds: string[];
  totalPrice: number;
  createdAt: Date;
}

/** Cross-module write port implemented by the order module. */
export interface IOrderWriter {
  createFromCart(input: CreateCartOrderInput): Promise<CartOrderResult>;
  returnOrder(orderId: Id, reason: Reason, actor: AuthActor): Promise<void>;
  refundOrder(orderId: Id, reason: Reason, actor: AuthActor): Promise<void>;
}
