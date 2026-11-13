import type { IEvent } from '@ecomerece/domain/events/event-bus.interface';
import type { OrderItemReadModel } from '@ecomerece/domain/modules/order-items/read-models/order-items.read-model';
import type { OrderItemFailureReason } from '@ecomerece/domain/modules/order-items/value-objects/failure-reason';
import type { ExpirationDate } from '@ecomerece/domain/value-objects/expiration-date.vo';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { Money } from '@ecomerece/domain/value-objects/money.vo';
import type { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';

export interface OrderItemInput {
  id: Id;
  orderId: Id;
  vendorId: Id;
  productId: Id;
  variantId: Id;
  quantity: Quantity;
  waitingTime: ExpirationDate;
  price: Money;
}

/** Only the ids are needed to cancel; `orderId` guards against cross-order cancels. */
export interface OrderItemCancelInput {
  id: Id;
  orderId: Id;
}

export interface OrderItemUpdateInput {
  id: Id;
  quantity: Quantity;
  waitingTime: ExpirationDate;
  price: Money;
}

/** A cart line rejected before it could become a real order item. */
export interface OrderItemFailureInput {
  id: Id;
  orderId: Id;
  variantId: Id;
  quantity: Quantity;
  waitingTime: ExpirationDate;
  reason: OrderItemFailureReason;
}

/** Fresh quote used to turn a failed line back into a real order item. */
export interface OrderItemRestoreInput {
  id: Id;
  productId: Id;
  vendorId: Id;
  price: Money;
}

export interface IOrderItemsWriter {
  create(items: OrderItemInput[]): Promise<IEvent[]>;
  cancel(items: OrderItemCancelInput[]): Promise<IEvent[]>;
  update(items: OrderItemUpdateInput[]): Promise<IEvent[]>;
  confirm(items: { id: Id }[]): Promise<IEvent[]>;
  complete(items: { id: Id }[]): Promise<IEvent[]>;
  returnItems(items: { id: Id }[]): Promise<IEvent[]>;
  refund(items: { id: Id }[]): Promise<IEvent[]>;
  /** Persists rejected lines with their reason; they carry no price or stock. */
  recordFailures(items: OrderItemFailureInput[]): Promise<IEvent[]>;
  /** Reopens failed lines with a fresh quote; the domain enforces failed -> pending. */
  restoreFailures(items: OrderItemRestoreInput[]): Promise<IEvent[]>;
}

/**
 * Cross-module read: any module (order, inventory, vendor, …) can ask for the
 * items belonging to an order without importing this module's persistence.
 */
export interface IOrderItemsQueries {
  getByOrderId(orderId: Id): Promise<OrderItemReadModel[]>;
  /** Rejected lines only, so a caller can retry fulfilling them later. */
  getFailedByOrderId(orderId: Id): Promise<OrderItemReadModel[]>;
  /** One rejected line, for a single-line retry. */
  getFailedById(id: Id): Promise<OrderItemReadModel | null>;
}
