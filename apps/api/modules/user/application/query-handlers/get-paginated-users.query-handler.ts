import type {
  GetPaginatedUsersQuery,
  GetPaginatedUsersResult,
} from '../queries/get-paginated-users.query';
import type { UserAppService } from '../user.app.service';

export class GetPaginatedUsersHandler {
  readonly type = 'GetPaginatedUsersQuery';
  constructor(private readonly appService: UserAppService) {}

  async handle(query: GetPaginatedUsersQuery): Promise<GetPaginatedUsersResult> {
    return await this.appService.findPublicPaginatedUsers(query.payload.query);
  }
}
