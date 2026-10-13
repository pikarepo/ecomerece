import { BadRequestError } from '../../../apps/api/errors/app-error';
import { DateVO } from './date.vo';

export class EffectiveDate extends DateVO {
  constructor(value: Date) {
    super(value);

    if (this.isFuture) {
      throw new BadRequestError('Effective date cannot be in the future.');
    }
  }

  static create(date: Date) {
    return new EffectiveDate(date);
  }
  static rehydrate(date: Date) {
    return new EffectiveDate(date);
  }
  /**
   * Creates an EffectiveDate representing today.
   */
  static today(): EffectiveDate {
    return new EffectiveDate(new Date());
  }

  /**
   * Creates an EffectiveDate N days ago.
   */
  static fromDaysAgo(days: number): EffectiveDate {
    if (days < 0) {
      throw new BadRequestError('Days cannot be negative.');
    }

    const date = new Date();
    date.setDate(date.getDate() - days);

    return new EffectiveDate(date);
  }

  /**
   * Returns a new EffectiveDate moved backward by N days.
   */
  subtractDays(days: number): EffectiveDate {
    if (days <= 0) {
      throw new BadRequestError('Days must be greater than 0.');
    }

    const date = new Date(this.value);
    date.setDate(date.getDate() - days);

    return new EffectiveDate(date);
  }

  /**
   * Returns a new EffectiveDate moved forward by N days.
   * Throws if the result would be in the future.
   */
  addDays(days: number): EffectiveDate {
    if (days <= 0) {
      throw new BadRequestError('Days must be greater than 0.');
    }

    const date = new Date(this.value);
    date.setDate(date.getDate() + days);

    return new EffectiveDate(date);
  }

  /**
   * Number of days since this date became effective.
   */
  get daysSince(): number {
    const diff = Date.now() - this.value.getTime();

    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Has this date been effective for at least N days?
   */
  hasPassedDays(days: number): boolean {
    return this.daysSince >= days;
  }

  /**
   * Returns true if this date is before another EffectiveDate.
   */
  isBefore(other: EffectiveDate): boolean {
    return this.value.getTime() < other.value.getTime();
  }

  /**
   * Returns true if this date is after another EffectiveDate.
   */
  isAfter(other: EffectiveDate): boolean {
    return this.value.getTime() > other.value.getTime();
  }

  /**
   * Returns the number of days between two EffectiveDates.
   */
  differenceInDays(other: EffectiveDate): number {
    const diff = Math.abs(this.value.getTime() - other.value.getTime());

    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}
