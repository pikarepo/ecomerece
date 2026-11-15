/**
 * Vendor-facing order view. The buyer identity, the other vendors on the order
 * and the cross-vendor total are withheld; a vendor only sees the money its own
 * lines are worth.
 */
export interface VendorOrderResponseReadModel {
  id: string;
  orderType: string;
  status: string;
  address: string;
  createdAt: Date;
  vendorSubtotal: number;
}

/** Vendor list row: enough to act on the order, nothing about the buyer or
 * the other vendors on it. */
export interface VendorOrderListItemReadModel {
  id: string;
  orderType: string;
  status: string;
  createdAt: Date;
}

export interface OrderResponseReadModel {
  id: string;
  buyerId: string;
  /** Every vendor the order buys from; one entry for a single order. */
  vendorIds: string[];
  orderType: string;
  totalPrice: number;
  address: string;
  status: string;
  createdAt: Date;
}
