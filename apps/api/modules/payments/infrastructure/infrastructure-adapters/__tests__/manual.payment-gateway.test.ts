import { describe, expect, it } from 'bun:test';
import { Money } from '@ecomerece/domain/value-objects/money.vo';
import { ManualPaymentGateway } from '../manual.payment-gateway';

describe('ManualPaymentGateway', () => {
  it('simulates intent/capture/refund successfully', async () => {
    const gw = new ManualPaymentGateway();
    const intent = await gw.createIntent({ orderId: 'o1', buyerId: 'b1', amount: Money.create(50), currency: 'USD' });
    expect(intent.providerRef).toContain('manual_pi_');
    const cap = await gw.capture({ providerRef: intent.providerRef, amount: Money.create(50), currency: 'USD' });
    expect(cap.success).toBe(true);
    const ref = await gw.refund({ providerRef: intent.providerRef, amount: Money.create(10), currency: 'USD', reason: 'r' });
    expect(ref.success).toBe(true);
  });
});
