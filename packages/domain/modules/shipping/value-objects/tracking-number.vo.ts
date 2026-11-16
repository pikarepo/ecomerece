import { BadRequestError } from '../../../errors/app-error';
import { StringVO } from '../../../value-objects';

/**
 * Tracking numbers are printed on labels and typed into carrier sites, so they
 * are restricted to the characters every carrier in use accepts.
 */
export class TrackingNumberVO extends StringVO {
  private static readonly ALLOWED = /^[A-Za-z0-9-]{6,40}$/;

  private constructor(value: string) {
    super(value.trim().toUpperCase());

    if (!TrackingNumberVO.ALLOWED.test(this.value)) {
      throw new BadRequestError(
        'Tracking number must be 6-40 characters of letters, digits or hyphens.',
      );
    }
  }

  static create(value: string): TrackingNumberVO {
    return new TrackingNumberVO(value);
  }

  static rehydrate(value: string): TrackingNumberVO {
    return new TrackingNumberVO(value);
  }
}
