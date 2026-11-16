import type {
  IPaymentQueries,
  IOrderQueries,
  EnsureActivePaymentResult,
} from '@ecomerece/contracts';
import type { Id, PaymentReadModel } from '@ecomerece/domain';
import { PaymentMapper } from '../infrastructure/payment.mapper';
import type { PaymentRepository } from '../infrastructure/payment.repository';

export class PaymentsInternalService {
  constructor(
    private readonly repo: PaymentRepository,
    private readonly orderQueries: IOrderQueries,
  ) {}

  async getPaymentById(id: Id): Promise<PaymentReadModel | null> {
    const p = await this.repo.FindById(id);
    return p ? this.toReadModel(p) : null;
  }

  async ensureActiveById(id: Id): Promise<EnsureActivePaymentResult> {
    const payment = await this.getPaymentById(id);
    if (!payment) return { payment: null, active: false };
    return { payment, active: true };
  }

  async getByOrderId(orderId: Id): Promise<PaymentReadModel[]> {
    const list = await this.repo.FindByOrderId(orderId);
    return list.map((p) => this.toReadModel(p));
  }

  async assertOrderActive(orderId: Id) {
    const res = await this.orderQueries.ensureActiveById(orderId);
    if (!res.order || !res.active) throw new Error('Order not found or no longer active.');
    return res.order;
  }

  private toReadModel(p: import('@ecomerece/domain').PaymentAggregate): PaymentReadModel {
    return {
      id: p.id.value,
      orderId: p.orderId.value,
      buyerId: p.buyerId.value,
      provider: p.provider.value,
      amount: p.amount.value,
      capturedAmount: p.capturedAmount.value,
      refundedAmount: p.refundedAmount.value,
      currency: p.currency,
      status: p.status.value,
      providerRef: p.providerRef,
      transactions: p.transactions.map((t) => ({
        type: t.type.value,
        amount: t.amount.value,
        providerRef: t.providerRef,
        reason: t.reason?.value ?? null,
        occurredAt: t.occurredAt.value,
      })),
      createdAt: p.createdAt.value,
    };
  }
}
