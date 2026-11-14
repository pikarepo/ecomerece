import { BadRequestError } from '../errors/app-error';

export abstract class NumberVO {
  constructor(protected readonly _value: number) {
    // NaN/Infinity would silently poison prices, stock and pagination limits.
    if (typeof _value !== 'number' || !Number.isFinite(_value)) {
      throw new BadRequestError('Value must be a finite number.');
    }
  }

  get value(): number {
    return this._value;
  }

  equals(other: NumberVO): boolean {
    return this.value === other.value;
  }

  greaterThan(value: number): boolean {
    return this.value > value;
  }

  lessThan(value: number): boolean {
    return this.value < value;
  }

  add(value: number): number {
    return this.value + value;
  }

  subtract(value: number): number {
    return this.value - value;
  }

  multiply(value: number): number {
    return this.value * value;
  }

  divide(value: number): number {
    return this.value / value;
  }

  toString(): string {
    return String(this.value);
  }
}
