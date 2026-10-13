import type { UserReadModel } from '@ecomerece/domain';
import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';

export class EnsureActiveUserGetByIdQuery
  implements IQuery<{ user: UserReadModel | null; active: boolean }>
{
  readonly __result?: { user: UserReadModel | null; active: boolean };
  readonly type = 'EnsureActiveUserGetByIdQuery';
  public readonly payload: { userId: Id };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ userId: Id }];
    this.payload = payload;
  }
}
