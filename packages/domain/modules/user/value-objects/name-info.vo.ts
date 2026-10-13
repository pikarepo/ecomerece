import type { PersonName } from '../../../value-objects';

export class NameInfoVO {
  private constructor(
    readonly firstName: PersonName,
    readonly middleName: PersonName | null,
    readonly lastName: PersonName | null,
    readonly fullName: string,
  ) {}
  static create(firstName: PersonName, middleName: PersonName | null, lastName: PersonName | null) {
    const arr = [];
    arr.push(firstName, middleName, lastName);
    return new NameInfoVO(firstName, middleName, lastName, arr.join(' '));
  }
  static rehydrate(
    firstName: PersonName,
    middleName: PersonName | null,
    lastName: PersonName | null,
    fullName: string,
  ) {
    return new NameInfoVO(firstName, middleName, lastName, fullName);
  }
}
