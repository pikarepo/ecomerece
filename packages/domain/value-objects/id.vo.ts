import { v7 as uuidv7 } from 'uuid';
import { BadRequestError } from '../../../apps/api/errors/app-error';
import { Identifier } from './identifier-vo';

export class Id extends Identifier<string> {
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
  }

  static create(value?: string): Id {
    return new Id(value ?? uuidv7());
  }
  static rehydrate(value: string): Id {
    return new Id(value);
  }
}
