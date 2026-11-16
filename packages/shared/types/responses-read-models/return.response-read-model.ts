export interface ReturnResponseReadModel {
  id: string;
  orderId: string;
  orderItemId: string;
  vendorId: string;
  buyerId: string;
  quantity: number;
  returnType: string;
  reason: string;
  status: string;
  decisionReason: string | null;
  requestedAt: Date;
  decidedAt: Date | null;
  receivedAt: Date | null;
  createdAt: Date;
}

export interface ReturnListItemResponseReadModel {
  id: string;
  orderId: string;
  orderItemId: string;
  quantity: number;
  returnType: string;
  status: string;
  requestedAt: Date;
  createdAt: Date;
}
