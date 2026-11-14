import { BadRequestError } from '../errors/app-error';
import { StringVO } from './string-vo';

// Lengths are measured on the trimmed value so padding cannot bypass the limits.
export class StreetAddressVO extends StringVO {
  constructor(value: string) {
    super(value.trim());

    if (this.value.length < 5 || this.value.length > 200) {
      throw new BadRequestError('Street address must be between 5 and 200 characters.');
    }
  }

  static create(value: string): StreetAddressVO {
    return new StreetAddressVO(value);
  }
  static rehydrate(value: string): StreetAddressVO {
    return new StreetAddressVO(value);
  }
}

export class CityVO extends StringVO {
  constructor(value: string) {
    super(value.trim());

    if (this.value.length < 2 || this.value.length > 100) {
      throw new BadRequestError('City must be between 2 and 100 characters.');
    }
  }

  static create(value: string): CityVO {
    return new CityVO(value);
  }
  static rehydrate(value: string): CityVO {
    return new CityVO(value);
  }
}

export class StateVO extends StringVO {
  constructor(value: string) {
    super(value.trim());

    if (this.value.length < 2 || this.value.length > 100) {
      throw new BadRequestError('State must be between 2 and 100 characters.');
    }
  }

  static create(value: string): StateVO {
    return new StateVO(value);
  }
  static rehydrate(value: string): StateVO {
    return new StateVO(value);
  }
}

export class PostalCodeVO extends StringVO {
  constructor(value: string) {
    super(value.trim());

    if (this.value.length < 3 || this.value.length > 20) {
      throw new BadRequestError('Postal code must be between 3 and 20 characters.');
    }
  }

  static create(value: string): PostalCodeVO {
    return new PostalCodeVO(value);
  }
  static rehydrate(value: string): PostalCodeVO {
    return new PostalCodeVO(value);
  }
}

export class CountryVO extends StringVO {
  constructor(value: string) {
    super(value.trim());

    if (this.value.length < 2 || this.value.length > 100) {
      throw new BadRequestError('Country must be between 2 and 100 characters.');
    }
  }

  static create(value: string): CountryVO {
    return new CountryVO(value);
  }
  static rehydrate(value: string): CountryVO {
    return new CountryVO(value);
  }
}

export class FullAddressVO extends StringVO {
  constructor(value: string) {
    super(value.trim());

    if (this.value.length < 10 || this.value.length > 500) {
      throw new BadRequestError('Full address must be between 10 and 500 characters.');
    }
  }

  static create(value: string): FullAddressVO {
    return new FullAddressVO(value);
  }
  static rehydrate(value: string): FullAddressVO {
    return new FullAddressVO(value);
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
