import { NumberVO } from './number.vo';

export class Percentage extends NumberVO {
  constructor(value: number) {
    super(value);

    if (value < 0 || value > 100) {
      throw new Error('Percentage must be between 0 and 100.');
    }
  }

  apply(amount: number): number {
    return amount * (this.value / 100);
  }
}
