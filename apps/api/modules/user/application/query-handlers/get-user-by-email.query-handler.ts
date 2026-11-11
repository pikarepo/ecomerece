import type {
  GetUserByEmailQuery,
  GetUserByEmailResult,
} from '../queries/get-user-by-email.query';
import type { UserInternalService } from '../user.internal.service';

export class GetUserByEmailHandler {
  readonly type = 'GetUserByEmailQuery';
  constructor(private readonly internalService: UserInternalService) {}

  async handle(query: GetUserByEmailQuery): Promise<GetUserByEmailResult> {
    return await this.internalService.getByEmail(query.payload.email);
  }
}
