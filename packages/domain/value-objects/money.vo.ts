import { NumberVO } from './number.vo';

export class Money extends NumberVO {
  constructor(amount: number) {
    super(amount);

    if (amount < 0) {
      throw new Error('Money cannot be negative.');
    }
  }

  addMoney(other: Money): Money {
    return new Money(this.value + other.value);
  }

  subtractMoney(other: Money): Money {
    return new Money(this.value - other.value);
  }

  times(quantity: number): Money {
    return new Money(this.value * quantity);
  }
  static zero(): Money {
    return new Money(0);
  }

  get isZero(): boolean {
    return this.value === 0;
  }
  static create(amount: number) {
    return new Money(amount);
  }
  static rehydrate(amount: number) {
    return new Money(amount);
  }
}
