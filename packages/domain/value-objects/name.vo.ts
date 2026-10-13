import { BadRequestError } from '../../../apps/api/errors/app-error';
import { StringVO } from './string-vo';

export class PersonName extends StringVO {
  constructor(value: string) {
    super(value);

    const trimmed = value.trim();

    if (trimmed.length < 1) {
      throw new BadRequestError('Name must contain at least one character.');
    }

    if (trimmed.length > 50) {
      throw new BadRequestError('Name cannot exceed 50 characters.');
    }

    if (trimmed.includes(' ')) {
      throw new BadRequestError('Name cannot contain spaces.');
    }

    if (!/^[A-Za-z]+$/.test(trimmed)) {
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
    super(value);

    const trimmed = value.trim();

    if (trimmed.length < 1) {
      throw new BadRequestError('Name must contain at least one character.');
    }

    if (trimmed.length > 50) {
      throw new BadRequestError('Name cannot exceed 50 characters.');
    }

    if (trimmed.includes(' ')) {
      throw new BadRequestError('Name cannot contain spaces.');
    }

    if (!/^[A-Za-z]+$/.test(trimmed)) {
      throw new BadRequestError('Name can only contain letters.');
    }
  }

  static create(name: string) {
    return new PersonName(name);
  }
}
