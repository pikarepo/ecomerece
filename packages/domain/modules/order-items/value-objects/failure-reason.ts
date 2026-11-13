/**
 * Why a cart line could not be turned into a buyable order item.
 *
 * Stored on the order item so the storefront can explain a dropped line when
 * the buyer did not request a safe (all-or-nothing) order.
 */
export const OrderItemFailureReasonEnum = {
  VARIANT_NOT_FOUND: 'variant_not_found',
  VARIANT_UNAVAILABLE: 'variant_unavailable',
  PRODUCT_UNAVAILABLE: 'product_unavailable',
  INVENTORY_NOT_FOUND: 'inventory_not_found',
  INVENTORY_DELETED: 'inventory_deleted',
  OUT_OF_STOCK: 'out_of_stock',
  INSUFFICIENT_STOCK: 'insufficient_stock',
} as const;

export type OrderItemFailureReason =
  (typeof OrderItemFailureReasonEnum)[keyof typeof OrderItemFailureReasonEnum];
