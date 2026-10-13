import { StringVO } from './string-vo';

export class StreetAddressVO extends StringVO {
  protected override validate(value: string): void {
    super.validate(value);
  }

  static create(value: string): StreetAddressVO {
    if (value.length < 5 || value.length > 200) {
      throw new Error('Street address must be between 5 and 200 characters.');
    }
    return new StreetAddressVO(value.trim());
  }
  static rehydrate(value: string): StreetAddressVO {
    return new StreetAddressVO(value.trim());
  }
}

export class CityVO extends StringVO {
  protected override validate(value: string): void {
    super.validate(value);
  }

  static create(value: string): CityVO {
    if (value.length < 2 || value.length > 100) {
      throw new Error('City must be between 2 and 100 characters.');
    }
    return new CityVO(value.trim());
  }
  static rehydrate(value: string): CityVO {
    return new CityVO(value.trim());
  }
}

export class StateVO extends StringVO {
  protected override validate(value: string): void {
    super.validate(value);
  }

  static create(value: string): StateVO {
    if (value.length < 2 || value.length > 100) {
      throw new Error('State must be between 2 and 100 characters.');
    }
    return new StateVO(value.trim());
  }
  static rehydrate(value: string): StateVO {
    return new StateVO(value.trim());
  }
}

export class PostalCodeVO extends StringVO {
  protected override validate(value: string): void {
    super.validate(value);
  }

  static create(value: string): PostalCodeVO {
    if (value.length < 3 || value.length > 20) {
      throw new Error('Postal code must be between 3 and 20 characters.');
    }
    return new PostalCodeVO(value.trim());
  }
  static rehydrate(value: string): PostalCodeVO {
    return new PostalCodeVO(value.trim());
  }
}

export class CountryVO extends StringVO {
  protected override validate(value: string): void {
    super.validate(value);
  }

  static create(value: string): CountryVO {
    if (value.length < 2 || value.length > 100) {
      throw new Error('Country must be between 2 and 100 characters.');
    }
    return new CountryVO(value.trim());
  }
  static rehydrate(value: string): CountryVO {
    return new CountryVO(value.trim());
  }
}

export class FullAddressVO extends StringVO {
  protected override validate(value: string): void {
    super.validate(value);
  }

  static create(value: string): FullAddressVO {
    if (value.length < 10 || value.length > 500) {
      throw new Error('Full address must be between 10 and 500 characters.');
    }
    return new FullAddressVO(value.trim());
  }
  static rehydrate(value: string): FullAddressVO {
    return new FullAddressVO(value.trim());
  }
}
export class AddressVO {
  private constructor(
    public readonly streetAddress: StreetAddressVO,
    public readonly city: CityVO,
    public readonly state: StateVO,
    public readonly postalCode: PostalCodeVO,
    public readonly country: CountryVO,
  ) {}

  static create(
    streetAddress: StreetAddressVO,
    city: CityVO,
    state: StateVO,
    postalCode: PostalCodeVO,
    country: CountryVO,
  ): AddressVO {
    return new AddressVO(streetAddress, city, state, postalCode, country);
  }

  static rehydrate(
    streetAddress: StreetAddressVO,
    city: CityVO,
    state: StateVO,
    postalCode: PostalCodeVO,
    country: CountryVO,
  ): AddressVO {
    return new AddressVO(streetAddress, city, state, postalCode, country);
  }

  get fullAddress(): FullAddressVO {
    return FullAddressVO.create(
      [
        this.streetAddress.value,
        this.city.value,
        this.state.value,
        this.postalCode.value,
        this.country.value,
      ].join(', '),
    );
  }

  equals(other: AddressVO): boolean {
    return (
      this.streetAddress.equals(other.streetAddress) &&
      this.city.equals(other.city) &&
      this.state.equals(other.state) &&
      this.postalCode.equals(other.postalCode) &&
      this.country.equals(other.country)
    );
  }

  toString(): string {
    return this.fullAddress.toString();
  }
}
