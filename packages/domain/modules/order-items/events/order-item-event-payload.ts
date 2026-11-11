import type { ExpirationDate, Id, Money, Quantity } from '../../../value-objects';

/** Shared payload for order-item lifecycle events (create/confirm/complete/…). */
export type OrderItemEventPayload = {
  orderItemId: Id;
  orderId: Id;
  vendorId: Id;
  productId: Id;
  variantId: Id;
  quantity: Quantity;
  price: Money;
  totalPrice: Money;
};

/** Payload for an order item whose quantity, price or waiting time changed. */
export type OrderItemUpdatedEventPayload = {
  orderItemId: Id;
  orderId: Id;
  quantity: Quantity;
  waitingTime: ExpirationDate;
  price: Money;
  totalPrice: Money;
};
