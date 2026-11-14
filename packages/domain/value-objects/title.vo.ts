import { BadRequestError } from '../errors/app-error';
import { StringVO } from './string-vo';

export class Title extends StringVO {
  constructor(value: string) {
    super(value.trim());

    if (this.value.length < 3) {
      throw new BadRequestError('Title must be at least 3 characters.');
    }

    if (this.value.length > 150) {
      throw new BadRequestError('Title cannot exceed 150 characters.');
    }
  }
  static create(title: string): Title {
    return new Title(title);
  }
  static rehydrate(title: string): Title {
    return new Title(title);
  }
}
