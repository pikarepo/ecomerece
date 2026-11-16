import { BadRequestError } from '../../../errors/app-error';
import { StringVO } from '../../../value-objects';

export const PayoutStatusEnum = {
  REQUESTED: 'requested',
  APPROVED: 'approved',
  PROCESSING: 'processing',
  PAID: 'paid',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

export type PayoutStatusType = (typeof PayoutStatusEnum)[keyof typeof PayoutStatusEnum];

export class PayoutStatusVO extends StringVO {
  private constructor(value: PayoutStatusType) {
    super(value);
  }
  static requested() {
    return new PayoutStatusVO(PayoutStatusEnum.REQUESTED);
  }
  static fromString(value: string) {
    if (!Object.values(PayoutStatusEnum).includes(value as PayoutStatusType))
      throw new BadRequestError(`Invalid payout status: "${value}"`);
    return new PayoutStatusVO(value as PayoutStatusType);
  }
  static rehydrate(v: PayoutStatusType) {
    return new PayoutStatusVO(v);
  }
  approve() {
    if (this.value !== PayoutStatusEnum.REQUESTED)
      throw new BadRequestError(`Cannot approve a ${this.value} payout.`);
    return new PayoutStatusVO(PayoutStatusEnum.APPROVED);
  }
  process() {
    if (this.value !== PayoutStatusEnum.APPROVED)
      throw new BadRequestError(`Cannot process a ${this.value} payout.`);
    return new PayoutStatusVO(PayoutStatusEnum.PROCESSING);
  }
  markPaid() {
    if (this.value !== PayoutStatusEnum.PROCESSING && this.value !== PayoutStatusEnum.APPROVED)
      throw new BadRequestError(`Cannot mark ${this.value} payout as paid.`);
    return new PayoutStatusVO(PayoutStatusEnum.PAID);
  }
  fail() {
    if (this.value === PayoutStatusEnum.PAID)
      throw new BadRequestError('Cannot fail a paid payout.');
    return new PayoutStatusVO(PayoutStatusEnum.FAILED);
  }
  cancel() {
    if (this.value === PayoutStatusEnum.PAID)
      throw new BadRequestError('Cannot cancel a paid payout.');
    return new PayoutStatusVO(PayoutStatusEnum.CANCELLED);
  }
  get status() {
    return this.value as PayoutStatusType;
  }
}
