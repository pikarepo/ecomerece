import type { ProductVariantReadModel } from '@ecomerece/domain';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { InMemoryQueryBus } from '../../../core/infrastructure/buses/in-memory-query-bus';
import { BaseService } from '../../../core/services/base.services';
import { productVariantMapper } from '../infrastructure/product-variant.mapper';
import type { ProductVariantRepository } from '../infrastructure/product-variant.repository';

export class productVariantInternalService extends BaseService {
  constructor(
    private readonly variantRepo: ProductVariantRepository,
    private readonly queryBus: InMemoryQueryBus,
  ) {
    super();
  }

  async ensureActiveVariantGetById(
    variantId: Id,
  ): Promise<{ variant: ProductVariantReadModel | null; active: boolean }> {
    const variant = await this.variantRepo.FindById(variantId);
    if (!variant) return { variant: null, active: false };
    if (variant.delete.isDeleted || !variant.active)
      return { variant: productVariantMapper.aggregateToReadModel(variant), active: false };
    return { variant: productVariantMapper.aggregateToReadModel(variant), active: true };
  }
  async verifyVariantsAndGet(ids: Id[]): Promise<{
    validIds: Id[];
    notFoundIds: Id[];
    deletedIds: Id[];
    nonActiveIds: Id[];
    variantReadModel: ProductVariantReadModel[];
  }> {
    const variants = await this.variantRepo.FindByIds(ids);
    const validVariants = variants.filter((v) => !v.delete.deleted && v.active);
    const validIdValues = new Set(validVariants.map((v) => v.id.value));
    const existingVariantIds = new Set(variants.map((v) => v.id.value));
    const foundIds = ids.filter((id) => existingVariantIds.has(id.value));
    const notFoundIds = ids.filter((id) => !existingVariantIds.has(id.value));
    const deletedIds = variants.filter((v) => v.delete.deleted).map((v) => v.id);
    const nonActiveIds = variants.filter((v) => !v.active).map((v) => v.id);
    const validIds = foundIds.filter((id) => validIdValues.has(id.value));
    const variantReadModel = validVariants.map((v) => productVariantMapper.aggregateToReadModel(v));
    return {
      validIds,
      notFoundIds,
      deletedIds,
      nonActiveIds,
      variantReadModel,
    };
  }
}
