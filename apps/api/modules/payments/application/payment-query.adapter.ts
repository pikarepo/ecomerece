import type { IPaymentQueries } from '@ecomerece/contracts';
import type { Id } from '@ecomerece/domain';
import type { PaymentsInternalService } from './payments.internal.service';

export class PaymentQueryAdapter implements IPaymentQueries {
  constructor(private readonly internal: PaymentsInternalService) {}
  ensureActiveById(paymentId: Id) {
    return this.internal.ensureActiveById(paymentId);
  }
  getByOrderId(orderId: Id) {
    return this.internal.getByOrderId(orderId);
  }
}
