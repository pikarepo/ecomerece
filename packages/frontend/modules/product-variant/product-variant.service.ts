// product-variant.service.ts

import type {
  createMyProductVariantDtoType,
  GetAdminPaginatedVariantsQueryDto,
  ProductVariantResponseReadModel,
  softDeleteMyVariantDtoType,
  toggleVariantApperaaracneDtoType,
  upadteMyVariantMetaDtoType,
  updateMyVariatPriceDtoType,
} from '@ecomerece/shared';
import { http } from './../../lib';

export type ProductVariantMutationResult = {
  message: string;
  updatedData?: ProductVariantResponseReadModel;
};

export type PaginatedVariantsResult = {
  data: ProductVariantResponseReadModel[];
  meta: {
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
  };
};

export class ProductVariantService {
  getVariantsByProductId(productId: string): Promise<ProductVariantResponseReadModel[]> {
    return http.get<ProductVariantResponseReadModel[]>(`/product-variant/${productId}`);
  }

  getAdminPaginatedVariants(
    params: GetAdminPaginatedVariantsQueryDto,
  ): Promise<PaginatedVariantsResult> {
    const searchParams = new URLSearchParams();
    if (params.productId) searchParams.set('productId', params.productId);
    if (params.active !== undefined) searchParams.set('active', String(params.active));
    if (params.deleted !== undefined) searchParams.set('deleted', String(params.deleted));
    if (params.search) searchParams.set('search', params.search);
    if (params.cursor) searchParams.set('cursor', params.cursor);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.direction) searchParams.set('direction', params.direction);
    const qs = searchParams.toString();
    return http.get<PaginatedVariantsResult>(`/product-variant/admin/all${qs ? `?${qs}` : ''}`);
  }

  createMyProductVariant(
    data: createMyProductVariantDtoType,
  ): Promise<ProductVariantMutationResult> {
    return http.post<ProductVariantMutationResult>('/product-variant/my', data);
  }

  updateMyVariantPrice(data: updateMyVariatPriceDtoType): Promise<ProductVariantMutationResult> {
    return http.patch<ProductVariantMutationResult>('/product-variant/my/price', data);
  }

  updateMyVariantMeta(data: upadteMyVariantMetaDtoType): Promise<ProductVariantMutationResult> {
    return http.patch<ProductVariantMutationResult>('/product-variant/my/meta', data);
  }

  toggleMyVariantAppearance(
    data: toggleVariantApperaaracneDtoType,
  ): Promise<ProductVariantMutationResult> {
    return http.patch<ProductVariantMutationResult>('/product-variant/my/appereance/toggle', data);
  }

  softDeleteMyVariant(data: softDeleteMyVariantDtoType): Promise<ProductVariantMutationResult> {
    return http.delete<ProductVariantMutationResult>('/product-variant/my/delete/soft', data);
  }

  recoverVariant(id: string): Promise<ProductVariantMutationResult> {
    return http.patch<ProductVariantMutationResult>(`/product-variant/recover/${id}`);
  }
}

export const productVariantService = new ProductVariantService();
