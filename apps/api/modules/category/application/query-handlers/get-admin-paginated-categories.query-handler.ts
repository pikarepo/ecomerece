import type { CategoryAppService } from '../category.app.service';
import type {
  GetAdminPaginatedCategoriesQuery,
  GetAdminPaginatedCategoriesResult,
} from '../queries/get-admin-paginated-categories.query';

export class GetAdminPaginatedCategoriesHandler {
  readonly type = 'GetAdminPaginatedCategoriesQuery';
  constructor(private readonly appService: CategoryAppService) {}

  async handle(
    query: GetAdminPaginatedCategoriesQuery,
  ): Promise<GetAdminPaginatedCategoriesResult> {
    return await this.appService.getAdminPaginatedCategories(query.payload.query);
  }
}
