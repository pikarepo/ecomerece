export type OrderRequestType = 'return' | 'refund';

export type OrderRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface OrderRequestResponseReadModel {
  id: string;
  orderId: string;
  orderItemId: string | null;
  vendorId: string;
  buyerId: string;
  type: OrderRequestType;
  status: OrderRequestStatus;
  reason: string;
  note: string | null;
  images: { url: string; key: string | null }[];
  vendorResponseNote: string | null;
  createdAt: Date;
  updatedAt: Date;
}
