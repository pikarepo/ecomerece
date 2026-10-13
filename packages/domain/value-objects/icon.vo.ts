export type IconVOProps = {
  name: string;
};

export class IconVO {
  private constructor(private readonly _name: string) {
    if (!this._name || this._name.trim().length === 0) {
      throw new Error('Icon name cannot be empty.');
    }
  }

  get name(): string {
    return this._name;
  }

  static create(name: string): IconVO {
    return new IconVO(name.trim());
  }

  static rehydrate(name: string): IconVO {
    return new IconVO(name);
  }

  equals(other: IconVO): boolean {
    return this._name === other._name;
  }
}
