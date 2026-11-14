import { BadRequestError } from '../errors/app-error';
import { StringVO } from './string-vo';

export class PhoneNumber extends StringVO {
  constructor(value: string) {
    super(value.trim());

    if (!/^\+?[0-9]{8,15}$/.test(this.value)) {
      throw new BadRequestError('Invalid phone number.');
    }
  }

  static create(phoneNumber: string) {
    return new PhoneNumber(phoneNumber);
  }

  static rehydrate(phoneNumber: string) {
    return new PhoneNumber(phoneNumber);
  }

  /** Digits only (plus an optional leading `+`) for comparisons and storage. */
  get normalized(): string {
    return this.value.replace(/[^+0-9]/g, '');
  }
}
