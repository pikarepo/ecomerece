import { BadRequestError } from '../errors/app-error';
import { StringVO } from './string-vo';

export class Description extends StringVO {
  constructor(value: string) {
    super(value.trim());

    if (this.value.length < 10) {
      throw new BadRequestError('Description must be at least 10 characters.');
    }

    if (this.value.length > 5000) {
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
