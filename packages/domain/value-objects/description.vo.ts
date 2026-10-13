import { BadRequestError } from '../../../apps/api/errors/app-error';
import { StringVO } from './string-vo';

export class Description extends StringVO {
  constructor(value: string) {
    super(value);

    const trimmed = value.trim();

    if (trimmed.length < 10) {
      throw new BadRequestError('Description must be at least 10 characters.');
    }

    if (trimmed.length > 5000) {
      throw new BadRequestError('Description cannot exceed 5000 characters.');
    }
  }
  static create(title: string): Description {
    return new Description(title);
  }
  static rehydrate(title: string): Description {
    return new Description(title);
  }
}
