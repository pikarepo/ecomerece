import { BadRequestError } from '../../../errors/app-error';
import { StringVO } from '../../../value-objects';

export const ShipmentStatusEnum = {
  PENDING: 'pending',
  DISPATCHED: 'dispatched',
  IN_TRANSIT: 'in_transit',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  FAILED: 'failed',
  RETURNED: 'returned',
  CANCELLED: 'cancelled',
} as const;

export type ShipmentStatusType = (typeof ShipmentStatusEnum)[keyof typeof ShipmentStatusEnum];

/**
 * A parcel moves forward through a fixed lifecycle. Every command returns the
 * next status instead of mutating, so a shipment can never skip a step or move
 * backwards, and `delivered`, `returned` and `cancelled` are final.
 */
export class ShipmentStatusVO extends StringVO {
  private constructor(value: ShipmentStatusType) {
    super(value);

    if (!Object.values(ShipmentStatusEnum).includes(this.value as ShipmentStatusType)) {
      throw new BadRequestError(`Invalid shipment status: "${this.value}"`);
    }
  }

  static pending(): ShipmentStatusVO {
    return new ShipmentStatusVO(ShipmentStatusEnum.PENDING);
  }

  static rehydrate(value: ShipmentStatusType): ShipmentStatusVO {
    return new ShipmentStatusVO(value);
  }

  static fromString(value: string): ShipmentStatusVO {
    if (!Object.values(ShipmentStatusEnum).includes(value as ShipmentStatusType)) {
      throw new BadRequestError(`Invalid shipment status: "${value}"`);
    }
    return new ShipmentStatusVO(value as ShipmentStatusType);
  }

  get status(): ShipmentStatusType {
    return this.value as ShipmentStatusType;
  }

  /** Delivered, returned and cancelled shipments are closed for edits. */
  get isFinal(): boolean {
    return (
      this.value === ShipmentStatusEnum.DELIVERED ||
      this.value === ShipmentStatusEnum.RETURNED ||
      this.value === ShipmentStatusEnum.CANCELLED
    );
  }

  ensureMutable(): void {
    if (this.isFinal) {
      throw new BadRequestError(`Cannot change a ${this.value} shipment.`);
    }
  }

  dispatch(): ShipmentStatusVO {
    if (this.value !== ShipmentStatusEnum.PENDING) {
      throw new BadRequestError(
        `Cannot dispatch a shipment that is not pending (current: ${this.value}).`,
      );
    }
    return new ShipmentStatusVO(ShipmentStatusEnum.DISPATCHED);
  }

  markInTransit(): ShipmentStatusVO {
    if (this.value !== ShipmentStatusEnum.DISPATCHED) {
      throw new BadRequestError(
        `Cannot mark a shipment in transit unless it was dispatched (current: ${this.value}).`,
      );
    }
    return new ShipmentStatusVO(ShipmentStatusEnum.IN_TRANSIT);
  }

  markOutForDelivery(): ShipmentStatusVO {
    if (
      this.value !== ShipmentStatusEnum.DISPATCHED &&
      this.value !== ShipmentStatusEnum.IN_TRANSIT
    ) {
      throw new BadRequestError(`Cannot mark a shipment out for delivery from ${this.value}.`);
    }
    return new ShipmentStatusVO(ShipmentStatusEnum.OUT_FOR_DELIVERY);
  }

  markDelivered(): ShipmentStatusVO {
    if (
      this.value !== ShipmentStatusEnum.DISPATCHED &&
      this.value !== ShipmentStatusEnum.IN_TRANSIT &&
      this.value !== ShipmentStatusEnum.OUT_FOR_DELIVERY
    ) {
      throw new BadRequestError(`Cannot deliver a shipment that is ${this.value}.`);
    }
    return new ShipmentStatusVO(ShipmentStatusEnum.DELIVERED);
  }

  markFailed(): ShipmentStatusVO {
    if (
      this.value === ShipmentStatusEnum.DELIVERED ||
      this.value === ShipmentStatusEnum.RETURNED ||
      this.value === ShipmentStatusEnum.CANCELLED
    ) {
      throw new BadRequestError(`Cannot fail a shipment that is ${this.value}.`);
    }
    return new ShipmentStatusVO(ShipmentStatusEnum.FAILED);
  }

  markReturned(): ShipmentStatusVO {
    if (
      this.value !== ShipmentStatusEnum.DISPATCHED &&
      this.value !== ShipmentStatusEnum.IN_TRANSIT &&
      this.value !== ShipmentStatusEnum.OUT_FOR_DELIVERY &&
      this.value !== ShipmentStatusEnum.DELIVERED &&
      this.value !== ShipmentStatusEnum.FAILED
    ) {
      throw new BadRequestError(`Cannot return a shipment that is ${this.value}.`);
    }
    return new ShipmentStatusVO(ShipmentStatusEnum.RETURNED);
  }

  cancel(): ShipmentStatusVO {
    if (this.value !== ShipmentStatusEnum.PENDING && this.value !== ShipmentStatusEnum.DISPATCHED) {
      throw new BadRequestError(
        `Only a pending or dispatched shipment can be cancelled (current: ${this.value}).`,
      );
    }
    return new ShipmentStatusVO(ShipmentStatusEnum.CANCELLED);
  }
}
