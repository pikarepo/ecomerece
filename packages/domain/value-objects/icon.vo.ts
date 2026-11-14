import { BadRequestError } from '../errors/app-error';

export type IconVOProps = {
  name: string;
};

export class IconVO {
  private constructor(name: string) {
    this._name = name.trim();

    if (this._name.length === 0) {
      throw new BadRequestError('Icon name cannot be empty.');
    }
  }

  private readonly _name: string;

  get name(): string {
    return this._name;
  }

  static create(name: string): IconVO {
    return new IconVO(name);
  }

  static rehydrate(name: string): IconVO {
    return new IconVO(name);
  }

  equals(other: IconVO): boolean {
    return this._name === other._name;
  }
}
