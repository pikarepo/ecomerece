import { BadRequestError } from '../errors/app-error';
import { NumberVO } from './number.vo';

export class Quantity extends NumberVO {
  constructor(value: number) {
    super(value);

    if (value < 0) {
      throw new BadRequestError('Quantity cannot be negative.');
    }
  }

  increase(amount: number): Quantity {
    return new Quantity(this.value + amount);
  }

  decrease(amount: number): Quantity {
    if (amount < 0) {
      throw new BadRequestError('Amount cannot be negative.');
    }

    if (amount > this.value) {
      throw new BadRequestError('Insufficient quantity.');
    }

    return new Quantity(this.value - amount);
  }

  static none() {
    return new Quantity(0);
  }
  static zero() {
    return new Quantity(0);
  }
  static create(quantity: number) {
    return new Quantity(quantity);
  }

  static rehydrate(quantity: number) {
    return new Quantity(quantity);
  }

  get isZero(): boolean {
    return this.value === 0;
  }

  get isPositive(): boolean {
    return this.value > 0;
  }
}
