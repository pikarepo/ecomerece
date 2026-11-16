import { BadRequestError } from '../../../errors/app-error';
import { StringVO } from '../../../value-objects';

export const ReturnStatusEnum = {
  REQUESTED: 'requested',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SHIPPED_BACK: 'shipped_back',
  RECEIVED: 'received',
  CANCELLED: 'cancelled',
} as const;

export type ReturnStatusType = (typeof ReturnStatusEnum)[keyof typeof ReturnStatusEnum];

/**
 * A return request moves one way: the buyer asks, the vendor decides, the goods
 * come back and are received. `rejected`, `received` and `cancelled` are final,
 * so a decided request can never be reopened and double-refunded.
 */
export class ReturnStatusVO extends StringVO {
  private constructor(value: ReturnStatusType) {
    super(value);

    if (!Object.values(ReturnStatusEnum).includes(this.value as ReturnStatusType)) {
      throw new BadRequestError(`Invalid return status: "${this.value}"`);
    }
  }

  static requested(): ReturnStatusVO {
    return new ReturnStatusVO(ReturnStatusEnum.REQUESTED);
  }

  static fromString(value: string): ReturnStatusVO {
    if (!Object.values(ReturnStatusEnum).includes(value as ReturnStatusType)) {
      throw new BadRequestError(`Invalid return status: "${value}"`);
    }
    return new ReturnStatusVO(value as ReturnStatusType);
  }

  get status(): ReturnStatusType {
    return this.value as ReturnStatusType;
  }

  get isFinal(): boolean {
    return (
      this.value === ReturnStatusEnum.REJECTED ||
      this.value === ReturnStatusEnum.RECEIVED ||
      this.value === ReturnStatusEnum.CANCELLED
    );
  }

  ensureMutable(): void {
    if (this.isFinal) {
      throw new BadRequestError(`Cannot change a ${this.value} return request.`);
    }
  }

  approve(): ReturnStatusVO {
    if (this.value !== ReturnStatusEnum.REQUESTED) {
      throw new BadRequestError(
        `Only a requested return can be approved (current: ${this.value}).`,
      );
    }
    return new ReturnStatusVO(ReturnStatusEnum.APPROVED);
  }

  reject(): ReturnStatusVO {
    if (this.value !== ReturnStatusEnum.REQUESTED) {
      throw new BadRequestError(
        `Only a requested return can be rejected (current: ${this.value}).`,
      );
    }
    return new ReturnStatusVO(ReturnStatusEnum.REJECTED);
  }

  markShippedBack(): ReturnStatusVO {
    if (this.value !== ReturnStatusEnum.APPROVED) {
      throw new BadRequestError(
        `Only an approved return can be shipped back (current: ${this.value}).`,
      );
    }
    return new ReturnStatusVO(ReturnStatusEnum.SHIPPED_BACK);
  }

  markReceived(): ReturnStatusVO {
    if (this.value !== ReturnStatusEnum.APPROVED && this.value !== ReturnStatusEnum.SHIPPED_BACK) {
      throw new BadRequestError(`Cannot receive a return that is ${this.value}.`);
    }
    return new ReturnStatusVO(ReturnStatusEnum.RECEIVED);
  }

  cancel(): ReturnStatusVO {
    if (this.value !== ReturnStatusEnum.REQUESTED && this.value !== ReturnStatusEnum.APPROVED) {
      throw new BadRequestError(
        `Only a requested or approved return can be cancelled (current: ${this.value}).`,
      );
    }
    return new ReturnStatusVO(ReturnStatusEnum.CANCELLED);
  }
}
