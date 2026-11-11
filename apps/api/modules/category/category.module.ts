import type { IImageStoragePort } from '@ecomerece/domain';
import type { Buses } from '../../core/infrastructure/buses/buses';
import { CategoryAppService } from './application/category.app.service';
import { CategoryInternalServcie } from './application/category.internal.service';
import { GetAdminPaginatedCategoriesQuery } from './application/queries/get-admin-paginated-categories.query';
import { GetCategoryByIdQuery } from './application/queries/get-category-by-id.query';
import { GetPaginatedCategoriesQuery } from './application/queries/get-paginated-categories.query';
import { VerifyCategoryAndGetQuery } from './application/queries/verify-category.query';
import { GetAdminPaginatedCategoriesHandler } from './application/query-handlers/get-admin-paginated-categories.query-handler';
import { GetCategoryByIdHandler } from './application/query-handlers/get-category-by-id.query-handler';
import { GetPaginatedCategoriesHandler } from './application/query-handlers/get-paginated-categories.query-handler';
import { VerifyCategoryAndGetHandler } from './application/query-handlers/verify-cateory-get.query-handler';
import { CategoryRepository } from './infrastructure/category.repository';
import { CategoryStatsAccessAdapter } from './infrastructure/category-stats-access.adapter';
import { CategoryController } from './presentation/category.controller';

interface CategoryModuleDeps extends Buses {
  imageStorage: IImageStoragePort;
}

export function createCategoryModule({ queryBus, eventBus, imageStorage }: CategoryModuleDeps) {
  const categoryRepository = new CategoryRepository();
  const categoryInternalService = new CategoryInternalServcie(categoryRepository);
  queryBus.register(
    VerifyCategoryAndGetQuery,
    new VerifyCategoryAndGetHandler(categoryInternalService),
  );
  const categoryAppService = new CategoryAppService(
    categoryRepository,
    eventBus,
    imageStorage,
  );
  queryBus.register(GetCategoryByIdQuery, new GetCategoryByIdHandler(categoryAppService));
  queryBus.register(
    GetPaginatedCategoriesQuery,
    new GetPaginatedCategoriesHandler(categoryAppService),
  );
  queryBus.register(
    GetAdminPaginatedCategoriesQuery,
    new GetAdminPaginatedCategoriesHandler(categoryAppService),
  );
  const categoryController = new CategoryController(categoryAppService);
  const statsAccess = new CategoryStatsAccessAdapter(categoryRepository);
  return { categoryController, statsAccess };
}
