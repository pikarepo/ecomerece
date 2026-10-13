import type { EnsureActiveQuery } from '../queries/ensure-active.query';
import type { UserInternalService } from '../user.internal.service';

export class EnsureActiveHandler {
  readonly type = 'EnsureActiveQuery';
  constructor(private readonly internalService: UserInternalService) {}
  async handle(query: EnsureActiveQuery): Promise<boolean> {
    return await this.internalService.ensureActive(query.payload.userId);
  }
}
