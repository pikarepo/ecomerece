export interface ReturnReadModel {
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
  deleted: {
    deleted: boolean;
    deletedFrom: Date | null;
    deletedBy: string | null;
    reason: string | null;
  };
  createdAt: Date;
}

export interface ReturnListItemReadModel {
  id: string;
  orderId: string;
  orderItemId: string;
  quantity: number;
  returnType: string;
  status: string;
  requestedAt: Date;
  createdAt: Date;
}
