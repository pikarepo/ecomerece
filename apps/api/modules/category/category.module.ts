import type { IImageStoragePort } from '@ecomerece/domain';
import type { Buses } from '../../core/infrastructure/buses/buses';
import { CategoryAppService } from './application/category.app.service';
import { CategoryInternalServcie } from './application/category.internal.service';
import { CategoryQueryAdapter } from './infrastructure/category-query.adapter';
import { CategoryRepository } from './infrastructure/category.repository';
import { CategoryStatsAccessAdapter } from './infrastructure/category-stats-access.adapter';
import { CategoryController } from './presentation/category.controller';

interface CategoryModuleDeps extends Buses {
  imageStorage: IImageStoragePort;
}

export function createCategoryModule({ eventBus, imageStorage }: CategoryModuleDeps) {
  const categoryRepository = new CategoryRepository();
  const categoryInternalService = new CategoryInternalServcie(categoryRepository);
  const categoryAppService = new CategoryAppService(categoryRepository, eventBus, imageStorage);
  const categoryController = new CategoryController(categoryAppService);
  const statsAccess = new CategoryStatsAccessAdapter(categoryRepository);
  const queries = new CategoryQueryAdapter(categoryInternalService);
  return { categoryController, statsAccess, queries };
}
