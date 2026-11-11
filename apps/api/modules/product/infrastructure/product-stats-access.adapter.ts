import type { IEntityExistsPort, IStatsAccessPort } from '@ecomerece/contracts';
import { Id } from '@ecomerece/domain';
import type { ProductRepository } from './product.repository';

/** Product-side implementation of the stats access/existence ports. */
export class ProductStatsAccessAdapter
  implements Pick<IStatsAccessPort, 'getProductVendorId'>, IEntityExistsPort
{
  constructor(private readonly repo: ProductRepository) {}

  async getProductVendorId(productId: string): Promise<string | null> {
    try {
      const product = await this.repo.FindById(Id.create(productId));
      return product?.vendorId.value ?? null;
    } catch {
      return null;
    }
  }

  Exists(id: Id): Promise<boolean> {
    return this.repo.Exists(id);
  }
}
