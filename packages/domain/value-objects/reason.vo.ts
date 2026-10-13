import { BadRequestError } from '../../../apps/api/errors/app-error';
import { StringVO } from './string-vo';

export class Reason extends StringVO {
  constructor(value: string) {
    super(value);

    if (value.length < 10) throw new BadRequestError('Reason too short.');
    if (value.length > 100) throw new BadRequestError('Reason is too long.');
  }
  static create(reason: string) {
    return new Reason(reason);
  }
  static rehydrate(reason: string) {
    return new Reason(reason);
  }
}
