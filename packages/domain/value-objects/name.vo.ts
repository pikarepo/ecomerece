import { BadRequestError } from '../errors/app-error';
import { StringVO } from './string-vo';

export class PersonName extends StringVO {
  constructor(value: string) {
    super(value.trim());

    if (this.value.length < 1) {
      throw new BadRequestError('Name must contain at least one character.');
    }

    if (this.value.length > 50) {
      throw new BadRequestError('Name cannot exceed 50 characters.');
    }

    if (this.value.includes(' ')) {
      throw new BadRequestError('Name cannot contain spaces.');
    }

    if (!/^[A-Za-z]+$/.test(this.value)) {
      throw new BadRequestError('Name can only contain letters.');
    }
  }

  static create(name: string) {
    return new PersonName(name);
  }
  static rehydrate(name: string) {
    return new PersonName(name);
  }
}

export class Name extends StringVO {
  constructor(value: string) {
    super(value.trim());

    if (this.value.length < 1) {
      throw new BadRequestError('Name must contain at least one character.');
    }

    if (this.value.length > 50) {
      throw new BadRequestError('Name cannot exceed 50 characters.');
    }

    if (!/^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/.test(this.value)) {
      throw new BadRequestError('Name can only contain letters, spaces, hyphens and apostrophes.');
    }
  }

  static create(name: string) {
    return new Name(name);
  }
  static rehydrate(name: string) {
    return new Name(name);
  }
}
