import type { IPaymentGateway } from '@ecomerece/domain';
import type { PaymentsConfig } from '../payments.config';
import { ManualPaymentGateway } from './infrastructure-adapters/manual.payment-gateway';

export type PaymentGatewayRegistry = {
  providers: Map<string, IPaymentGateway>;
  defaultProvider: string;
};

export function createPaymentGateways(config: PaymentsConfig): PaymentGatewayRegistry {
  const providers = new Map<string, IPaymentGateway>();
  for (const name of config.providers) {
    switch (name) {
      case 'manual':
        providers.set('manual', new ManualPaymentGateway());
        break;
    }
  }
  return { providers, defaultProvider: config.defaultProvider };
}

export function resolveGateway(registry: PaymentGatewayRegistry, name?: string): IPaymentGateway {
  const key = (name ?? registry.defaultProvider).trim().toLowerCase();
  const gw = registry.providers.get(key);
  if (!gw) {
    throw new Error(
      `Payment provider "${key}" is not configured. Configured: ${[...registry.providers.keys()].join(', ') || 'none'}.`,
    );
  }
  return gw;
}
