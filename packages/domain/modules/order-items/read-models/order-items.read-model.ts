import type { OrderItemFailureReason } from '../value-objects/failure-reason';

export interface OrderItemReadModel {
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
  failureReason: OrderItemFailureReason | null;
  delete: {
    deleted: boolean;
    deletedFrom: Date | null;
    deletedBy: string | null;
    reason: string | null;
  };

  createdAt: Date;
}
