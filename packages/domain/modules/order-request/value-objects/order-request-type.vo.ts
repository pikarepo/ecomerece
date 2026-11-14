import { BadRequestError } from '../../../errors/app-error';

export type OrderRequestType = 'return' | 'refund';

export class OrderRequestTypeVO {
  private constructor(private readonly _value: OrderRequestType) {}

  get value(): OrderRequestType {
    return this._value;
  }

  get isReturn(): boolean {
    return this._value === 'return';
  }

  get isRefund(): boolean {
    return this._value === 'refund';
  }

  static create(type: string): OrderRequestTypeVO {
    const normalized = type?.toLowerCase().trim();
    if (normalized !== 'return' && normalized !== 'refund') {
      throw new BadRequestError(`Invalid order request type: ${type}. Must be 'return' or 'refund'.`);
    }
    return new OrderRequestTypeVO(normalized as OrderRequestType);
  }

  static return(): OrderRequestTypeVO {
    return new OrderRequestTypeVO('return');
  }

  static refund(): OrderRequestTypeVO {
    return new OrderRequestTypeVO('refund');
  }

  static rehydrate(type: string): OrderRequestTypeVO {
    return new OrderRequestTypeVO(type as OrderRequestType);
  }

  equals(other: OrderRequestTypeVO): boolean {
    return this._value === other._value;
  }
}
