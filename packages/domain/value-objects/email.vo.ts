import { StringVO } from './string-vo';

export class EmailVO extends StringVO {
  constructor(email: string) {
    super(email);

    if (!EmailVO.isValid(email)) {
      throw new Error('Invalid email.');
    }
  }
  static create(email: string) {
    return new EmailVO(email);
  }
  static isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  get domain(): string {
    return this.value.split('@')[1];
  }

  get username(): string {
    return this.value.split('@')[0];
  }
}
