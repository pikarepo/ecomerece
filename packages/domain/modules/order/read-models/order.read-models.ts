export interface OrderReadModel {
  id: string;
  buyerId: string;
  /** Every vendor the order buys from; one entry for a single order. */
  vendorIds: string[];
  orderType: string;
  totalPrice: number;
  address: string;
  status: string;
  deleted: {
    deleted: boolean;
    deletedFrom?: Date | null;
    deletedBy?: string | null;
    reason?: string | null;
  };

  createdAt: Date;
}
