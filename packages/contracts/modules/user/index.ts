import type { UserReadModel } from '@ecomerece/domain';
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

/** Result of checking whether a user exists and may act. */
export interface EnsureActiveUserResult {
  user: UserReadModel | null;
  active: boolean;
}

/** Cross-module read port implemented by the user module. */
export interface IUserQueries {
  ensureActiveById(userId: Id): Promise<EnsureActiveUserResult>;
  ensureActive(userId: Id): Promise<boolean>;
}
