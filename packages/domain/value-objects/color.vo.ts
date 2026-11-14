import { BadRequestError } from '../errors/app-error';

export type ColorVOProps = {
  value: string;
};

export class ColorVO {
  private constructor(private readonly _value: string) {
    this.validate(_value);
  }

  get value(): string {
    return this._value;
  }

  private validate(value: string): void {
    const hexRegex = /^#([A-Fa-f0-9]{8}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexRegex.test(value)) {
      throw new BadRequestError(`Invalid hex color format: ${value}`);
    }
  }

  static create(value: string): ColorVO {
    return new ColorVO(value.trim());
  }

  static rehydrate(value: string): ColorVO {
    return new ColorVO(value);
  }

  equals(other: ColorVO): boolean {
    return this._value.toLowerCase() === other._value.toLowerCase();
  }
}
