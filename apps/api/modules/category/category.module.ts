import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { queryBus } from '../../core/infrastructure/buses/in-memory-query-bus';
import { createImageStorageModule } from '../image-storage/image-storage.module';
import { CategoryAppService } from './application/category.app.service';
import { CategoryInternalServcie } from './application/category.internal.service';
import { VerifyCategoryAndGetQuery } from './application/queries/verify-category.query';
import { VerifyCategoryAndGetHandler } from './application/query-handlers/verify-cateory-get.query-handler';
import { CategoryRepository } from './infrastructure/category.repository';
import { CategoryController } from './presentation/category.controller';

export function createCategoryModule() {
  const categoryRepository = new CategoryRepository();
  const categoryInternalService = new CategoryInternalServcie(categoryRepository);
  queryBus.register(
    VerifyCategoryAndGetQuery,
    new VerifyCategoryAndGetHandler(categoryInternalService),
  );
  const categoryAppService = new CategoryAppService(
    categoryRepository,
    eventBus,
    createImageStorageModule(),
  );
  const categoryController = new CategoryController(categoryAppService);
  return { categoryController };
}
