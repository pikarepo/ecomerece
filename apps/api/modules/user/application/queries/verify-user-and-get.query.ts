import type { UserReadModel } from '@ecomerece/domain';
import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';

export class VerifyUserAndGetQuery
  implements
    IQuery<{
      validIds: Id[];
      notFoundIds: Id[];
      bannedIds: Id[];
      blockedIds: Id[];
      deletedIds: Id[];
      userReadModel: UserReadModel[];
    }>
{
  readonly __result?: {
    validIds: Id[];
    notFoundIds: Id[];
    bannedIds: Id[];
    blockedIds: Id[];
    deletedIds: Id[];
    userReadModel: UserReadModel[];
  };
  readonly type = 'VerifyUserAndGetQuery';
  public readonly payload: { ids: Id[] };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ ids: Id[] }];
    this.payload = payload;
  }
}
