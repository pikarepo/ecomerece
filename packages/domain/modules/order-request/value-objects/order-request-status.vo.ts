import { BadRequestError } from '../../../errors/app-error';

export type OrderRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export class OrderRequestStatusVO {
  private constructor(private readonly _value: OrderRequestStatus) {}

  get value(): OrderRequestStatus {
    return this._value;
  }

  get isPending(): boolean {
    return this._value === 'pending';
  }

  get isAccepted(): boolean {
    return this._value === 'accepted';
  }

  get isRejected(): boolean {
    return this._value === 'rejected';
  }

  get isCancelled(): boolean {
    return this._value === 'cancelled';
  }

  static create(status: string): OrderRequestStatusVO {
    const normalized = status?.toLowerCase().trim();
    if (
      normalized !== 'pending' &&
      normalized !== 'accepted' &&
      normalized !== 'rejected' &&
      normalized !== 'cancelled'
    ) {
      throw new BadRequestError(`Invalid order request status: ${status}.`);
    }
    return new OrderRequestStatusVO(normalized as OrderRequestStatus);
  }

  static pending(): OrderRequestStatusVO {
    return new OrderRequestStatusVO('pending');
  }

  static accepted(): OrderRequestStatusVO {
    return new OrderRequestStatusVO('accepted');
  }

  static rejected(): OrderRequestStatusVO {
    return new OrderRequestStatusVO('rejected');
  }

  static cancelled(): OrderRequestStatusVO {
    return new OrderRequestStatusVO('cancelled');
  }

  static rehydrate(status: string): OrderRequestStatusVO {
    return new OrderRequestStatusVO(status as OrderRequestStatus);
  }

  equals(other: OrderRequestStatusVO): boolean {
    return this._value === other._value;
  }
}
