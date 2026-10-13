import type { categoryReadModels, Id } from '@ecomerece/domain';
import { BaseService } from '../../../core/services/base.services';
import { CategoryMapper } from '../infrastructure/category.mapper';
import type { CategoryRepository } from '../infrastructure/category.repository';

export class CategoryInternalServcie extends BaseService {
  constructor(private readonly categoryRepo: CategoryRepository) {
    super();
  }

  async VerifyCategoryAndGet(
    id: Id,
  ): Promise<{ isValid: boolean; category: null | categoryReadModels }> {
    const doc = await this.categoryRepo.FindById(id);
    if (!doc) return { isValid: false, category: null };

    if (doc.delete.isDeleted || doc.block.isBlocked)
      return { isValid: false, category: CategoryMapper.aggregateToReadModel(doc) };
    return { isValid: true, category: CategoryMapper.aggregateToReadModel(doc) };
  }
}
