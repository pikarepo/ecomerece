import { BadRequestError } from '../errors/app-error';
import { StringVO } from './string-vo';

const MAX_EMAIL_LENGTH = 254;

export class EmailVO extends StringVO {
  constructor(email: string) {
    super(email.trim());

    if (!EmailVO.isValid(this.value)) {
      throw new BadRequestError('Invalid email.');
    }
  }
  static create(email: string) {
    return new EmailVO(email);
  }
  static rehydrate(email: string) {
    return new EmailVO(email);
  }
  static isValid(email: string): boolean {
    const value = email.trim();
    return (
      value.length > 0 &&
      value.length <= MAX_EMAIL_LENGTH &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    );
  }

  get domain(): string {
    return this.value.split('@')[1];
  }

  get username(): string {
    return this.value.split('@')[0];
  }

  /** Canonical form for storage and lookups; email comparison is case-insensitive. */
  get normalized(): string {
    return this.value.toLowerCase();
  }

  override equals(other: StringVO): boolean {
    return this.normalized === other.value.toLowerCase();
  }
}
