import type {
  IPaymentGateway,
  PaymentCaptureRequest,
  PaymentGatewayResult,
  PaymentIntentRequest,
  PaymentIntentResult,
  PaymentRefundRequest,
} from '@ecomerece/domain';

/**
 * Manual/offline adapter. No external gateway is contacted: it simulates the
 * provider responses so checkout and reconciliation flows can run end-to-end now
 * and be swapped for a real SDK-backed adapter later without touching callers.
 */
export class ManualPaymentGateway implements IPaymentGateway {
  readonly name = 'manual';

  async createIntent(request: PaymentIntentRequest): Promise<PaymentIntentResult> {
    return {
      providerRef: `manual_pi_${request.orderId}`,
      clientSecret: null,
      raw: { simulated: true },
    };
  }

  async authorize(request: PaymentIntentRequest): Promise<PaymentGatewayResult> {
    return { providerRef: `manual_pi_${request.orderId}`, success: true, raw: { simulated: true } };
  }

  async capture(request: PaymentCaptureRequest): Promise<PaymentGatewayResult> {
    return { providerRef: request.providerRef, success: true, raw: { simulated: true } };
  }

  async cancel(providerRef: string | null): Promise<PaymentGatewayResult> {
    return { providerRef, success: true, raw: { simulated: true } };
  }

  async refund(request: PaymentRefundRequest): Promise<PaymentGatewayResult> {
    return {
      providerRef: request.providerRef,
      success: true,
      raw: { simulated: true, reason: request.reason ?? null },
    };
  }

  async parseWebhook(
    payload: unknown,
  ): Promise<{ providerRef: string | null; event: string; amount?: number; orderId?: string }> {
    const p = (payload ?? {}) as Record<string, unknown>;
    return {
      providerRef: typeof p.providerRef === 'string' ? p.providerRef : null,
      event: typeof p.event === 'string' ? p.event : 'unknown',
      amount: typeof p.amount === 'number' ? p.amount : undefined,
      orderId: typeof p.orderId === 'string' ? p.orderId : undefined,
    };
  }
}
