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
  getVariantById(id: string): Promise<ProductVariantResponseReadModel> {
    return http.get<ProductVariantResponseReadModel>(`/product-variant/${id}`);
  }

  getVendorPaginatedVariants(
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
    return http.get<PaginatedVariantsResult>(`/product-variant/vendor/all${qs ? `?${qs}` : ''}`);
  }
  getVariantsByProductId(productId: string): Promise<ProductVariantResponseReadModel[]> {
    return http.get<ProductVariantResponseReadModel[]>(`/product-variant/product/${productId}`);
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
    return http.post<ProductVariantMutationResult>('/product-variant/vendor', data);
  }

  updateMyVariantPrice(data: updateMyVariatPriceDtoType): Promise<ProductVariantMutationResult> {
    return http.patch<ProductVariantMutationResult>('/product-variant/vendor/price', data);
  }

  updateMyVariantMeta(data: upadteMyVariantMetaDtoType): Promise<ProductVariantMutationResult> {
    return http.patch<ProductVariantMutationResult>('/product-variant/vendor/meta', data);
  }

  toggleMyVariantAppearance(
    data: toggleVariantApperaaracneDtoType,
  ): Promise<ProductVariantMutationResult> {
    return http.patch<ProductVariantMutationResult>(
      '/product-variant/vendor/appearance/toggle',
      data,
    );
  }

  softDeleteMyVariant(data: softDeleteMyVariantDtoType): Promise<ProductVariantMutationResult> {
    return http.delete<ProductVariantMutationResult>('/product-variant/vendor/soft', data);
  }

  recoverVariant(id: string): Promise<ProductVariantMutationResult> {
    return http.patch<ProductVariantMutationResult>(`/product-variant/admin/${id}/recover`);
  }
}

export const productVariantService = new ProductVariantService();
