import type {
  GetAdminPaymentsQueryDto,
  GetMyPaymentsQueryDto,
  PaymentListItemResponseReadModel,
  PaymentResponseReadModel,
  capturePaymentDtoType,
  createPaymentDtoType,
  paymentReasonDtoType,
  refundPaymentDtoType,
} from '@ecomerece/shared';
import { http } from '../../lib';

export type PaginatedPaymentsResult = {
  data: PaymentListItemResponseReadModel[];
  meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
};

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params))
    if (v !== undefined && v !== '') sp.set(k, String(v));
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

export class PaymentsService {
  createMyPayment(
    data: createPaymentDtoType,
  ): Promise<PaymentResponseReadModel & { clientSecret?: string | null }> {
    return http.post('/payment/my', data);
  }
  getMyPayments(params: GetMyPaymentsQueryDto): Promise<PaginatedPaymentsResult> {
    return http.get(`/payment/my/all${buildQuery(params as any)}`);
  }
  getMyPaymentById(id: string): Promise<PaymentResponseReadModel> {
    return http.get(`/payment/my/${id}`);
  }
  authorizePayment(id: string): Promise<PaymentResponseReadModel> {
    return http.post(`/payment/my/${id}/authorize`, {});
  }
  capturePayment(id: string, data: capturePaymentDtoType): Promise<PaymentResponseReadModel> {
    return http.post(`/payment/my/${id}/capture`, data);
  }
  cancelPayment(id: string, data: paymentReasonDtoType): Promise<PaymentResponseReadModel> {
    return http.post(`/payment/my/${id}/cancel`, data);
  }

  getAdminPayments(params: GetAdminPaymentsQueryDto): Promise<PaginatedPaymentsResult> {
    return http.get(`/payment/admin/all${buildQuery(params as any)}`);
  }
  getAdminPaymentById(id: string): Promise<PaymentResponseReadModel> {
    return http.get(`/payment/admin/${id}`);
  }
  refundAdminPayment(id: string, data: refundPaymentDtoType): Promise<PaymentResponseReadModel> {
    return http.post(`/payment/admin/${id}/refund`, data);
  }
}

export const paymentsService = new PaymentsService();
