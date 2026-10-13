export interface OrderItemReadModel {
  _id: string;
  orderId: string;
  vendorId: string;
  productId: string;
  variantId: string;
  quantity: number;
  waitingTime: Date;
  status: string;
  totalPrice: number;
  price: number;
  delete: {
    deleted: boolean;
    deletedFrom: Date | null;
    deletedBy: string | null;
    reason: string | null;
  };

  createdAt: Date;
}
