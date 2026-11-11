import type { CategoryAppService } from '../category.app.service';
import type {
  GetPaginatedCategoriesQuery,
  GetPaginatedCategoriesResult,
} from '../queries/get-paginated-categories.query';

export class GetPaginatedCategoriesHandler {
  readonly type = 'GetPaginatedCategoriesQuery';
  constructor(private readonly appService: CategoryAppService) {}

  async handle(query: GetPaginatedCategoriesQuery): Promise<GetPaginatedCategoriesResult> {
    return await this.appService.getPaginatedCategories(query.payload.query);
  }
}
