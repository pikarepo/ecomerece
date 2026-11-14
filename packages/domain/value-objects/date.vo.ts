import { BadRequestError } from '../errors/app-error';

export abstract class DateVO {
  constructor(protected readonly _value: Date) {
    if (!(_value instanceof Date) || Number.isNaN(_value.getTime())) {
      throw new BadRequestError('Invalid date.');
    }
  }

  // Return a copy so callers cannot mutate the value through the getter.
  get value(): Date {
    return new Date(this._value);
  }

  equals(other: DateVO): boolean {
    return this.value.getTime() === other.value.getTime();
  }

  before(date: Date): boolean {
    return this._value.getTime() < date.getTime();
  }

  after(date: Date): boolean {
    return this._value.getTime() > date.getTime();
  }

  get isPast(): boolean {
    return this._value.getTime() < Date.now();
  }

  get isFuture(): boolean {
    return this._value.getTime() > Date.now();
  }

  get timestamp(): number {
    return this._value.getTime();
  }

  toISOString(): string {
    return this._value.toISOString();
  }

  toJSON(): string {
    return this.toISOString();
  }
}
