export interface PaymentTransactionReadModel {
  type: string;
  amount: number;
  providerRef: string | null;
  reason: string | null;
  occurredAt: Date;
}

export interface PaymentReadModel {
  id: string;
  orderId: string;
  buyerId: string;
  provider: string;
  amount: number;
  capturedAmount: number;
  refundedAmount: number;
  currency: string;
  status: string;
  providerRef: string | null;
  transactions: PaymentTransactionReadModel[];
  createdAt: Date;
}

export interface PaymentListItemReadModel {
  id: string;
  orderId: string;
  buyerId: string;
  provider: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: Date;
}
