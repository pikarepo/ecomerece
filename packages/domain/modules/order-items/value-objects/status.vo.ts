import { BadRequestError } from '../../../../../apps/api/errors/app-error';
import { StringVO } from '../../../value-objects';

export const StatusEnum = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  RETURNED: 'returned',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
} as const;

export type StatusType = (typeof StatusEnum)[keyof typeof StatusEnum];

export class StatusVo extends StringVO {
  private constructor(value: StatusType) {
    super(value);

    if (!Object.values(StatusEnum).includes(this.value as StatusType)) {
      throw new BadRequestError(`Invalid order status: "${this.value}"`);
    }
  }

  static rehydrate(value: StatusType): StatusVo {
    return new StatusVo(value);
  }

  static pending(): StatusVo {
    return new StatusVo(StatusEnum.PENDING);
  }

  static confirmed(): StatusVo {
    return new StatusVo(StatusEnum.CONFIRMED);
  }

  static completed(): StatusVo {
    return new StatusVo(StatusEnum.COMPLETED);
  }

  static returned(): StatusVo {
    return new StatusVo(StatusEnum.RETURNED);
  }

  static refunded(): StatusVo {
    return new StatusVo(StatusEnum.REFUNDED);
  }

  static cancelled(): StatusVo {
    return new StatusVo(StatusEnum.CANCELLED);
  }

  static fromString(value: string): StatusVo {
    if (!Object.values(StatusEnum).includes(value as StatusType)) {
      throw new BadRequestError(`Invalid order status: "${value}"`);
    }
    return new StatusVo(value as StatusType);
  }
  toStatusType(): StatusType {
    return this.value as StatusType;
  }

  confirm(): StatusVo {
    if (this.value !== StatusEnum.PENDING) {
      throw new BadRequestError(
        `Cannot confirm a status that is not pending (current: ${this.value})`,
      );
    }
    return StatusVo.confirmed();
  }

  complete(): StatusVo {
    if (this.value !== StatusEnum.CONFIRMED) {
      throw new BadRequestError(
        `Cannot complete a status that is not confirmed (current: ${this.value})`,
      );
    }
    return StatusVo.completed();
  }

  cancel(): StatusVo {
    if (this.value === StatusEnum.COMPLETED || this.value === StatusEnum.REFUNDED) {
      throw new BadRequestError(`Cannot cancel a ${this.value} order`);
    }
    return StatusVo.cancelled();
  }

  return(): StatusVo {
    if (this.value !== StatusEnum.CONFIRMED && this.value !== StatusEnum.COMPLETED) {
      throw new BadRequestError(
        `Cannot return a status that is not confirmed or completed (current: ${this.value})`,
      );
    }
    return StatusVo.returned();
  }

  refund(): StatusVo {
    if (this.value === StatusEnum.REFUNDED) {
      throw new BadRequestError(
        `Cannot refund a status that is already refunded (current: ${this.value})`,
      );
    }
    if (
      this.value !== StatusEnum.CONFIRMED &&
      this.value !== StatusEnum.COMPLETED &&
      this.value !== StatusEnum.RETURNED
    ) {
      throw new BadRequestError(
        `Cannot refund a status that is not confirmed, completed, or returned (current: ${this.value})`,
      );
    }
    return StatusVo.refunded();
  }

  isPending(): boolean {
    return this.value === StatusEnum.PENDING;
  }

  isConfirmed(): boolean {
    return this.value === StatusEnum.CONFIRMED;
  }

  isCompleted(): boolean {
    return this.value === StatusEnum.COMPLETED;
  }

  isReturned(): boolean {
    return this.value === StatusEnum.RETURNED;
  }
  isRefunded(): boolean {
    return this.value === StatusEnum.REFUNDED;
  }
  isCancelled(): boolean {
    return this.value === StatusEnum.CANCELLED;
  }

  toString(): string {
    return this.value;
  }
}
