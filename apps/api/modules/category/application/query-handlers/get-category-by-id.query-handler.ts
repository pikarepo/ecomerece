import type { CategoryAppService } from '../category.app.service';
import type {
  GetCategoryByIdQuery,
  GetCategoryByIdResult,
} from '../queries/get-category-by-id.query';

export class GetCategoryByIdHandler {
  readonly type = 'GetCategoryByIdQuery';
  constructor(private readonly appService: CategoryAppService) {}

  async handle(query: GetCategoryByIdQuery): Promise<GetCategoryByIdResult> {
    return await this.appService.getCategoryById(query.payload.id.value);
  }
}
