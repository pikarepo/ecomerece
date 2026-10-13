import type { UserReadModel } from '@ecomerece/domain';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { VerifyUserAndGetQuery } from '../queries/verify-user-and-get.query';
import type { UserInternalService } from '../user.internal.service';

export class VerifyUserAndGetHandler {
  readonly type = 'VerifyUserAndGetQuery';
  constructor(private readonly internalService: UserInternalService) {}

  async handle(query: VerifyUserAndGetQuery): Promise<{
    validIds: Id[];
    notFoundIds: Id[];
    bannedIds: Id[];
    blockedIds: Id[];
    deletedIds: Id[];
    userReadModel: UserReadModel[];
  }> {
    return await this.internalService.verifyUserAndGet(query.payload.ids);
  }
}
