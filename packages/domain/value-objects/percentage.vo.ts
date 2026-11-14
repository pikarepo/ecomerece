import { BadRequestError } from '../errors/app-error';
import { NumberVO } from './number.vo';

export class Percentage extends NumberVO {
  constructor(value: number) {
    super(value);

    if (value < 0 || value > 100) {
      throw new BadRequestError('Percentage must be between 0 and 100.');
    }
  }

  static create(value: number) {
    return new Percentage(value);
  }

  static rehydrate(value: number) {
    return new Percentage(value);
  }

  apply(amount: number): number {
    return amount * (this.value / 100);
  }

  /** The complement, useful for discounts: 30 → 70. */
  get remainder(): Percentage {
    return new Percentage(100 - this.value);
  }
}
