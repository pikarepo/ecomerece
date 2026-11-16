import { BadRequestError } from '../../../errors/app-error';
import { StringVO } from '../../../value-objects';

/**
 * Provider name recorded on a payment intent. New adapters are registered in the
 * API factory without changing the aggregate: the value object only guards that
 * the stored name is usable as an identifier.
 */
export class PaymentProviderVO extends StringVO {
  private constructor(value: string) {
    const normalized = value.trim().toLowerCase();
    if (normalized.length < 2 || normalized.length > 40) {
      throw new BadRequestError('Payment provider must be 2-40 characters.');
    }
    if (!/^[a-z0-9_-]+$/.test(normalized)) {
      throw new BadRequestError('Payment provider may only contain a-z, 0-9, "_" and "-".');
    }
    super(normalized);
  }

  static create(value: string): PaymentProviderVO {
    return new PaymentProviderVO(value);
  }

  static rehydrate(value: string): PaymentProviderVO {
    return new PaymentProviderVO(value);
  }
}
