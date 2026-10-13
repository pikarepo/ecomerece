import { BadRequestError } from '../../../apps/api/errors/app-error';
import { StringVO } from './string-vo';

export class Title extends StringVO {
  constructor(value: string) {
    super(value);

    const trimmed = value.trim();

    if (trimmed.length < 3) {
      throw new BadRequestError('Title must be at least 3 characters.');
    }

    if (trimmed.length > 150) {
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
