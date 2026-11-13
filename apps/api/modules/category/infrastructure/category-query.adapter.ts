import type { ICategoryQueries, VerifyCategoryResult } from '@ecomerece/contracts';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { CategoryInternalServcie } from '../application/category.internal.service';

/** Contract-facing adapter for category reads. */
export class CategoryQueryAdapter implements ICategoryQueries {
  constructor(private readonly internalService: CategoryInternalServcie) {}

  verifyAndGet(id: Id): Promise<VerifyCategoryResult> {
    return this.internalService.VerifyCategoryAndGet(id);
  }
}
