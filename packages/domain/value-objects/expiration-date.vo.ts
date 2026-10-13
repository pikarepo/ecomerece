import { BadRequestError } from '../../../apps/api/errors/app-error';
import { DateVO } from './date.vo';

export class ExpirationDate extends DateVO {
  private constructor(value: Date, validate: boolean = true) {
    super(value);

    if (validate && this.isPast) {
      throw new BadRequestError('Expiration date must be in the future.');
    }
  }

  // --- Existing methods ---
  static create(date: Date): ExpirationDate {
    return new ExpirationDate(date, false);
  }

  static rehydrate(date: Date): ExpirationDate {
    return new ExpirationDate(date, false);
  }

  static fromDays(days: number): ExpirationDate {
    if (days <= 0) {
      throw new BadRequestError('Expiration days must be greater than 0.');
    }

    const date = new Date();
    date.setDate(date.getDate() + days);

    return new ExpirationDate(date);
  }

  addDays(days: number): ExpirationDate {
    if (days <= 0) {
      throw new BadRequestError('Days must be greater than 0.');
    }

    const date = new Date(this.value);
    date.setDate(date.getDate() + days);

    return new ExpirationDate(date);
  }

  subtractDays(days: number): ExpirationDate {
    if (days <= 0) {
      throw new BadRequestError('Days must be greater than 0.');
    }

    const date = new Date(this.value);
    date.setDate(date.getDate() - days);

    return new ExpirationDate(date);
  }

  get remainingDays(): number {
    const diffMs = this.value.getTime() - Date.now();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  // --- New methods for hours ---
  static fromHours(hours: number): ExpirationDate {
    if (hours <= 0) {
      throw new BadRequestError('Expiration hours must be greater than 0.');
    }

    const date = new Date();
    date.setHours(date.getHours() + hours);

    return new ExpirationDate(date);
  }

  addHours(hours: number): ExpirationDate {
    if (hours <= 0) {
      throw new BadRequestError('Hours must be greater than 0.');
    }

    const date = new Date(this.value);
    date.setHours(date.getHours() + hours);

    return new ExpirationDate(date);
  }

  subtractHours(hours: number): ExpirationDate {
    if (hours <= 0) {
      throw new BadRequestError('Hours must be greater than 0.');
    }

    const date = new Date(this.value);
    date.setHours(date.getHours() - hours);

    return new ExpirationDate(date);
  }

  get remainingHours(): number {
    const diffMs = this.value.getTime() - Date.now();
    return Math.ceil(diffMs / (1000 * 60 * 60));
  }

  // --- New methods for seconds ---
  static fromSeconds(seconds: number): ExpirationDate {
    if (seconds <= 0) {
      throw new BadRequestError('Expiration seconds must be greater than 0.');
    }

    const date = new Date();
    date.setSeconds(date.getSeconds() + seconds);

    return new ExpirationDate(date);
  }

  addSeconds(seconds: number): ExpirationDate {
    if (seconds <= 0) {
      throw new BadRequestError('Seconds must be greater than 0.');
    }

    const date = new Date(this.value);
    date.setSeconds(date.getSeconds() + seconds);

    return new ExpirationDate(date);
  }

  subtractSeconds(seconds: number): ExpirationDate {
    if (seconds <= 0) {
      throw new BadRequestError('Seconds must be greater than 0.');
    }

    const date = new Date(this.value);
    date.setSeconds(date.getSeconds() - seconds);

    return new ExpirationDate(date);
  }

  get remainingSeconds(): number {
    const diffMs = this.value.getTime() - Date.now();
    return Math.ceil(diffMs / 1000);
  }
}
