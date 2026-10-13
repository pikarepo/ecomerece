export abstract class DateVO {
  constructor(protected readonly _value: Date) {}

  get value(): Date {
    return this._value;
  }

  equals(other: DateVO): boolean {
    return this.value.getTime() === other.value.getTime();
  }

  before(date: Date): boolean {
    return this.value < date;
  }

  after(date: Date): boolean {
    return this.value > date;
  }

  get isPast(): boolean {
    return this.value < new Date();
  }

  get isFuture(): boolean {
    return this.value > new Date();
  }

  get timestamp(): number {
    return this.value.getTime();
  }

  toISOString(): string {
    return this.value.toISOString();
  }
}
