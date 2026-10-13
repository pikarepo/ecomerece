import { StringVO } from './string-vo';

export class PhoneNumber extends StringVO {
  constructor(value: string) {
    super(value);

    if (!/^\+?[0-9]{8,15}$/.test(value)) {
      throw new Error('Invalid phone number.');
    }
  }
  static create(title: string) {
    return new PhoneNumber(title);
  }
}
