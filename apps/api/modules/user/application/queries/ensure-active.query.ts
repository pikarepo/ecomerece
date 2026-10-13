import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';

export class EnsureActiveQuery implements IQuery<boolean> {
  readonly __result?: boolean;
  readonly type = 'EnsureActiveQuery';
  public readonly payload: { userId: Id };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ userId: Id }];
    this.payload = payload;
  }
}
