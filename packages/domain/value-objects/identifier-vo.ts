import { BadRequestError } from '../../../apps/api/errors/app-error';

export abstract class Identifier<T extends string | number> {
  protected constructor(protected readonly _value: T) {
    if (_value === '' || _value === null || _value === undefined) {
      throw new BadRequestError('Identifier cannot be empty.');
    }
  }

  get value(): T {
    return this._value;
  }

  equals(other: unknown): boolean {
    if (!(other instanceof Identifier)) {
      return false;
    }
    return other.constructor === this.constructor && other.value === this.value;
  }

  toString(): string {
    return String(this.value);
  }
}
