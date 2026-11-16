export interface PaymentTransactionResponseReadModel {
  type: string;
  amount: number;
  providerRef: string | null;
  reason: string | null;
  occurredAt: Date;
}

export interface PaymentResponseReadModel {
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
  transactions: PaymentTransactionResponseReadModel[];
  createdAt: Date;
}

export interface PaymentListItemResponseReadModel {
  id: string;
  orderId: string;
  buyerId: string;
  provider: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: Date;
}
