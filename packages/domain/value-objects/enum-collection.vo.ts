import { BadRequestError } from '../../../apps/api/errors/app-error';
import type { EnumVO } from './enum.vo';

export class EnumCollectionVO<T extends string, E extends EnumVO<T>> {
  private constructor(private readonly _values: readonly E[]) {}

  static create<T extends string, E extends EnumVO<T>>(
    values: readonly E[] = [],
  ): EnumCollectionVO<T, E> {
    const unique: E[] = [];

    for (const value of values) {
      if (unique.some((v) => v.equals(value))) {
        throw new BadRequestError(`'${value.value}' already exists in the collection.`);
      }

      unique.push(value);
    }

    return new EnumCollectionVO(Object.freeze(unique));
  }

  static fromStrings<T extends string, E extends EnumVO<T>>(
    values: readonly string[],
    factory: (value: string) => E,
  ): EnumCollectionVO<T, E> {
    return EnumCollectionVO.create(values.map(factory));
  }

  get value(): readonly E[] {
    return this._values;
  }

  has(value: E): boolean {
    return this._values.some((v) => v.equals(value));
  }

  add(value: E): EnumCollectionVO<T, E> {
    if (this.has(value)) {
      throw new BadRequestError(`'${value.value}' already exists in the collection.`);
    }

    return EnumCollectionVO.create([...this._values, value]);
  }

  remove(value: E): EnumCollectionVO<T, E> {
    return EnumCollectionVO.create(this._values.filter((v) => !v.equals(value)));
  }

  equals(other: EnumCollectionVO<T, E>): boolean {
    if (this._values.length !== other._values.length) {
      return false;
    }

    return this._values.every((value, index) => value.equals(other._values[index]));
  }

  get count(): number {
    return this._values.length;
  }

  get isEmpty(): boolean {
    return this._values.length === 0;
  }

  toArray(): readonly E[] {
    return [...this._values];
  }

  toValues(): readonly T[] {
    return this._values.map((v) => v.value);
  }

  toString(): string {
    return this.toValues().join(', ');
  }
}
