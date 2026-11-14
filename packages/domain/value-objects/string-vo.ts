import { BadRequestError } from '../errors/app-error';

export abstract class StringVO {
  protected static defaultValidate(value: string): void {
    if (!value.trim()) {
      throw new BadRequestError('Value cannot be empty.');
    }
  }

  protected validate(value: string): void {
    StringVO.defaultValidate(value);
  }

  constructor(protected readonly _value: string) {
    this.validate(_value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: StringVO): boolean {
    return this.value === other.value;
  }

  // Plain objects are common in events/tests; keep equality value-based on both shapes.
  valueOf(): string {
    return this.value;
  }

  contains(text: string): boolean {
    return this.value.includes(text);
  }

  startsWith(text: string): boolean {
    return this.value.startsWith(text);
  }

  endsWith(text: string): boolean {
    return this.value.endsWith(text);
  }

  get length(): number {
    return this.value.length;
  }

  get isEmpty(): boolean {
    return this.value.length === 0;
  }

  toLower(): string {
    return this.value.toLowerCase();
  }

  toUpper(): string {
    return this.value.toUpperCase();
  }

  trim(): string {
    return this.value.trim();
  }

  toString(): string {
    return this.value;
  }
}
