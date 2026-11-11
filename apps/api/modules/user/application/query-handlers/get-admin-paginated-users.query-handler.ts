import type {
  GetAdminPaginatedUsersQuery,
  GetAdminPaginatedUsersResult,
} from '../queries/get-admin-paginated-users.query';
import type { UserAppService } from '../user.app.service';

export class GetAdminPaginatedUsersHandler {
  readonly type = 'GetAdminPaginatedUsersQuery';
  constructor(private readonly appService: UserAppService) {}

  async handle(query: GetAdminPaginatedUsersQuery): Promise<GetAdminPaginatedUsersResult> {
    return await this.appService.findAdminPaginatedUsers(query.payload.query);
  }
}
