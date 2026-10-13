import type { UserReadModel } from '@ecomerece/domain';
import type { GetUserByIdQuery } from '../queries/get-user-by-id.query';
import type { UserInternalService } from '../user.internal.service';

export class GetUserByIdHandler {
  readonly type = 'GetUserByIdQuery';
  constructor(private readonly internalService: UserInternalService) {}

  async handle(query: GetUserByIdQuery): Promise<UserReadModel | null> {
    return await this.internalService.getById(query.payload.userId);
  }
}
