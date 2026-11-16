import type { Id, PaymentListItemReadModel, PaymentReadModel } from '@ecomerece/domain';

export interface EnsureActivePaymentResult {
  payment: PaymentReadModel | null;
  active: boolean;
}

export interface IPaymentQueries {
  ensureActiveById(paymentId: Id): Promise<EnsureActivePaymentResult>;
  getByOrderId(orderId: Id): Promise<PaymentReadModel[]>;
}
