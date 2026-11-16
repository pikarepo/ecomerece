import { BadRequestError } from '../../../errors/app-error';
import { StringVO } from '../../../value-objects';

export const CarrierEnum = {
  DHL: 'dhl',
  FEDEX: 'fedex',
  UPS: 'ups',
  TCS: 'tcs',
  LEOPARDS: 'leopards',
  LOCAL: 'local',
} as const;

export type CarrierType = (typeof CarrierEnum)[keyof typeof CarrierEnum];

/**
 * Carriers are an allow-list rather than free text: the vendor UI, the tracking
 * URL pattern and the rate table are all keyed on this value, so an unknown
 * carrier would silently break tracking.
 */
export class CarrierVO extends StringVO {
  private constructor(value: CarrierType) {
    super(value);

    if (!Object.values(CarrierEnum).includes(this.value as CarrierType)) {
      throw new BadRequestError(`Invalid carrier: "${this.value}"`);
    }
  }

  static create(value: string): CarrierVO {
    if (!Object.values(CarrierEnum).includes(value as CarrierType)) {
      throw new BadRequestError(`Invalid carrier: "${value}"`);
    }
    return new CarrierVO(value as CarrierType);
  }

  static rehydrate(value: string): CarrierVO {
    return CarrierVO.create(value);
  }

  get carrier(): CarrierType {
    return this.value as CarrierType;
  }
}
