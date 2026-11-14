export interface OrderRequestReadModel {
  id: string;
  orderId: string;
  orderItemId: string | null;
  vendorId: string;
  buyerId: string;
  type: 'return' | 'refund';
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  reason: string;
  note: string | null;
  vendorResponseNote: string | null;
  createdAt: Date;
  updatedAt: Date;
}
