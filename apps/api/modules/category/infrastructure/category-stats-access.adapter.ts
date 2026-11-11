import type { IEntityExistsPort } from '@ecomerece/contracts';
import type { Id } from '@ecomerece/domain';
import type { CategoryRepository } from './category.repository';

/** Category-side existence port used by the stats view guard. */
export class CategoryStatsAccessAdapter implements IEntityExistsPort {
  constructor(private readonly repo: CategoryRepository) {}

  Exists(id: Id): Promise<boolean> {
    return this.repo.Exists(id);
  }
}
