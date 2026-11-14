import { v7 as uuidv7 } from 'uuid';
import { BadRequestError } from '../errors/app-error';
import { Identifier } from './identifier-vo';

export class Id extends Identifier<string> {
  // Ids reach queries and URLs, so whitespace/quotes/control characters are refused.
  private static readonly ALLOWED = /^[A-Za-z0-9_-]{5,40}$/;

  private constructor(value: string) {
    super(value);

    if (typeof value !== 'string') {
      throw new BadRequestError('Id must be a string.');
    }

    if (value.length < 5) {
      throw new BadRequestError('Id is too short.');
    }
    if (value.length > 40) {
      throw new BadRequestError('Id is too long.');
    }
    if (!Id.ALLOWED.test(value)) {
      throw new BadRequestError('Id contains invalid characters.');
    }
  }

  static create(value?: string): Id {
    return new Id(value ?? uuidv7());
  }
  static rehydrate(value: string): Id {
    return new Id(value);
  }

  static isValid(value: string): boolean {
    return Id.ALLOWED.test(value) && value.length >= 5 && value.length <= 40;
  }
}
