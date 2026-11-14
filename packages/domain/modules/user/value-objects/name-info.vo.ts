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
    // A missing middle name must not leave a double space in the derived
    // full name — consumers validate it as a single Name value.
    const fullName = arr
      .filter((part): part is PersonName => part !== null)
      .map((part) => part.value)
      .join(' ');
    return new NameInfoVO(firstName, middleName, lastName, fullName);
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
