import { NumberVO } from './number.vo';

export class Quantity extends NumberVO {
  constructor(value: number) {
    super(value);

    if (value < 0) {
      throw new Error('Quantity cannot be negative.');
    }
  }

  increase(amount: number): Quantity {
    return new Quantity(this.value + amount);
  }

  decrease(amount: number): Quantity {
    if (amount > this.value) {
      throw new Error('Insufficient quantity.');
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
}
