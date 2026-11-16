import { EffectiveDate } from '../../../value-objects';
import type { ShipmentStatusVO } from './shipment-status.vo';

/**
 * One entry in the parcel's audit trail. The status is stored as text so the
 * timeline stays readable even if the enum gains states later.
 */
export class TrackingEventVO {
  private constructor(
    readonly status: ShipmentStatusVO,
    readonly note: string | null,
    readonly occurredAt: EffectiveDate,
  ) {}

  static create(status: ShipmentStatusVO, note: string | null = null): TrackingEventVO {
    return new TrackingEventVO(status, note, EffectiveDate.today());
  }

  static rehydrate(
    status: ShipmentStatusVO,
    note: string | null,
    occurredAt: EffectiveDate,
  ): TrackingEventVO {
    return new TrackingEventVO(status, note, occurredAt);
  }
}
