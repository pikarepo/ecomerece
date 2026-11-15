/** Vendor view of one line: the vendor already knows it owns the line, so the
 * owning vendor id is not echoed back. */
export type VendorOrderItemResponseReadModel = Omit<OrderItemResponseReadModel, 'vendorId'>;

export interface OrderItemResponseReadModel {
  _id: string;
  orderId: string;
  /** Null only for rejected lines, which were never resolved to a product/vendor. */
  vendorId: string | null;
  /** Null only for rejected lines, which were never resolved to a product/vendor. */
  productId: string | null;
  variantId: string;
  quantity: number;
  waitingTime: Date;
  status: string;
  totalPrice: number;
  /** Null only for rejected lines: no price was ever agreed. */
  price: number | null;
  /** Set only when the line was rejected instead of bought. */
  failureReason: string | null;

  createdAt: Date;
}
