import type { Money } from '../../../value-objects';

/**
 * Provider adapter seam. The payments module calls this port and never a gateway
 * SDK directly, so connecting/adding/switching providers is a new adapter + env.
 */
export interface PaymentIntentRequest {
  orderId: string;
  buyerId: string;
  amount: Money;
  currency: string;
  idempotencyKey?: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResult {
  providerRef: string | null;
  clientSecret?: string | null;
  raw?: Record<string, unknown>;
}

export interface PaymentCaptureRequest {
  providerRef: string | null;
  amount: Money;
  currency: string;
}

export interface PaymentRefundRequest {
  providerRef: string | null;
  amount: Money;
  currency: string;
  reason?: string;
}

export interface PaymentGatewayResult {
  providerRef: string | null;
  success: boolean;
  raw?: Record<string, unknown>;
}

export interface IPaymentGateway {
  readonly name: string;
  createIntent(request: PaymentIntentRequest): Promise<PaymentIntentResult>;
  authorize?(request: PaymentIntentRequest): Promise<PaymentGatewayResult>;
  capture(request: PaymentCaptureRequest): Promise<PaymentGatewayResult>;
  cancel?(providerRef: string | null): Promise<PaymentGatewayResult>;
  refund(request: PaymentRefundRequest): Promise<PaymentGatewayResult>;
  /** Verifies and normalizes a provider webhook/callback payload. */
  parseWebhook?(
    payload: unknown,
    headers: Record<string, string | undefined>,
  ): Promise<{
    providerRef: string | null;
    event: string;
    amount?: number;
    orderId?: string;
  }>;
}
