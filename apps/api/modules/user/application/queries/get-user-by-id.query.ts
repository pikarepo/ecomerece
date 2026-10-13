import type { UserReadModel } from '@ecomerece/domain';
import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';

export class GetUserByIdQuery implements IQuery<UserReadModel | null> {
  readonly __result?: UserReadModel | null;
  readonly type = 'GetUserByIdQuery';
  public readonly payload: { userId: Id };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ userId: Id }];
    this.payload = payload;
  }
}
