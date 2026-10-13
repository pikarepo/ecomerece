import { BadRequestError } from '../../../apps/api/errors/app-error';
import { StringVO } from './string-vo';

export class AltVO extends StringVO {
  constructor(value: string) {
    super(value.trim());

    if (this.value.length < 3) {
      throw new BadRequestError('Image alt text must be at least 3 characters.');
    }

    if (this.value.length > 150) {
      throw new BadRequestError('Image alt text cannot exceed 150 characters.');
    }
  }

  static create(value: string): AltVO {
    return new AltVO(value);
  }
}
