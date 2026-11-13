import type { EnsureActiveUserResult, IUserQueries } from '@ecomerece/contracts';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { UserInternalService } from '../application/user.internal.service';

/** Contract-facing adapter for user reads. */
export class UserQueryAdapter implements IUserQueries {
  constructor(private readonly internalService: UserInternalService) {}

  ensureActiveById(userId: Id): Promise<EnsureActiveUserResult> {
    return this.internalService.ensureActiveUserGetById(userId);
  }

  ensureActive(userId: Id): Promise<boolean> {
    return this.internalService.ensureActive(userId);
  }
}
