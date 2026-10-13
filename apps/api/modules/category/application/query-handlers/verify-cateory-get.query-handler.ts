import type { categoryReadModels } from '@ecomerece/domain';
import type { CategoryInternalServcie } from '../category.internal.service';
import type { VerifyCategoryAndGetQuery } from '../queries/verify-category.query';

export class VerifyCategoryAndGetHandler {
  readonly type = 'VerifyCategoryAndGetQuery';
  constructor(private readonly internalService: CategoryInternalServcie) {}
  async handle(
    query: VerifyCategoryAndGetQuery,
  ): Promise<{ isValid: boolean; category: null | categoryReadModels }> {
    return await this.internalService.VerifyCategoryAndGet(query.payload.id);
  }
}
