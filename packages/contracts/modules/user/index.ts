import type { UserReadModel } from '@ecomerece/domain';
import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';

/**
 * Authenticated caller shape exposed to other modules. It mirrors the subset of
 * the user record controllers and application services rely on, without leaking
 * the user module's persistence model across module boundaries.
 */
export interface AuthActor {
  _id: string;
  image: string;
  name: { fullName: string };
}

/** Result of the live DB state lookup performed by the auth middleware. */
export interface AuthUserSnapshot {
  actor: AuthActor;
  role: string | undefined;
  blocked: boolean;
  banned: boolean;
  deleted: boolean;
}

/** Port the auth middleware uses to validate a token holder against live DB state. */
export interface IAuthUserLookup {
  findAuthUser(userId: string): Promise<AuthUserSnapshot | null>;
}

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

export class EnsureActiveQuery implements IQuery<boolean> {
  readonly __result?: boolean;
  readonly type = 'EnsureActiveQuery';
  public readonly payload: { userId: Id };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ userId: Id }];
    this.payload = payload;
  }
}
