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
