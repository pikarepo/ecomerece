import { BadRequestError } from '../../../apps/api/errors/app-error';
import { StringVO } from './string-vo';

export abstract class EnumVO<T extends string> extends StringVO {
  protected constructor(value: string, allowed: readonly T[]) {
    super(value.trim().toLowerCase());

    if (!allowed.includes(this.value as T)) {
      throw new BadRequestError(`Invalid value '${value}'. Allowed values: ${allowed.join(', ')}`);
    }
  }

  override get value(): T {
    return super.value as T;
  }
}
1;
