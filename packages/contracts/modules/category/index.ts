import type { categoryReadModels, Id } from '@ecomerece/domain';

/** Result of validating a category before attaching a product to it. */
export interface VerifyCategoryResult {
  isValid: boolean;
  category: null | categoryReadModels;
}

/** Cross-module read port implemented by the category module. */
export interface ICategoryQueries {
  verifyAndGet(id: Id): Promise<VerifyCategoryResult>;
}
