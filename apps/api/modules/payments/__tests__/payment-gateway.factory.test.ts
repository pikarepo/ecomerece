import type { IPaymentGateway } from '@ecomerece/domain';
import { describe, expect, it } from 'bun:test';
import { BadRequestError } from '../../../errors/app-error';
import { resolveGateway, type PaymentGatewayRegistry } from '../infrastructure/payment-gateway.factory';

const manualGateway = {} as IPaymentGateway;
const registry: PaymentGatewayRegistry = {
  providers: new Map<string, IPaymentGateway>([['manual', manualGateway]]),
  defaultProvider: 'manual',
};

describe('resolveGateway', () => {
  it('returns a configured provider', () => {
    expect(resolveGateway(registry, 'manual')).toBe(manualGateway);
  });

  it('rejects an unknown provider as a client error', () => {
    expect(() => resolveGateway(registry, '../../etc/passwd')).toThrow(BadRequestError);
  });
});
