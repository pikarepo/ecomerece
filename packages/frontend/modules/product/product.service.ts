// product.service.ts

import type {
  blockLiftProductDtoType,
  blockProductDtoType,
  CreateMyProductDto,
  deafultImageDtoType,
  disclaimerItemsDtoType,
  GetAdminPaginatedProductsQueryDto,
  GetMyPaginatedProductsQueryDto,
  imagesDtoType,
  ingredientsDtotype,
  ProductAdminResponseReadModel,
  ProductPublicSort,
  ProductResponseReadModel,
  productAppereanceDtoType,
  recoverProductDtoType,
  softDeleteMyProductDtoType,
  toggleDiscalimerDtoType,
  toggleIngredientsDtoType,
  updateProductMetaDtoType,
} from '@ecomerece/shared';
import { http } from './../../lib';

export type ProductMutationResult = {
  message: string;
  updatedData?: ProductResponseReadModel;
};

export type PaginatedProductsResult = {
  data: ProductResponseReadModel[];
  meta: {
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
  };
};

export type PaginatedAdminProductsResult = {
  data: ProductAdminResponseReadModel[];
  meta: {
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
  };
};

export class ProductService {
  getProductById(id: string): Promise<ProductResponseReadModel> {
    return http.get<ProductResponseReadModel>(`/product/${id}`);
  }

  getPaginatedProducts(params: {
    categoryId?: string;
    vendorId?: string;
    appearance?: 'public' | 'private';
    search?: string;
    cursor?: string;
    limit?: number;
    direction?: 'next' | 'prev';
    sort?: ProductPublicSort;
  }): Promise<PaginatedProductsResult> {
    const searchParams = new URLSearchParams();
    if (params.categoryId) searchParams.set('categoryId', params.categoryId);
    if (params.vendorId) searchParams.set('vendorId', params.vendorId);
    if (params.appearance) searchParams.set('appearance', params.appearance);
    if (params.search) searchParams.set('search', params.search);
    if (params.cursor) searchParams.set('cursor', params.cursor);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.direction) searchParams.set('direction', params.direction);
    if (params.sort) searchParams.set('sort', params.sort);
    const qs = searchParams.toString();
    return http.get<PaginatedProductsResult>(`/product${qs ? `?${qs}` : ''}`);
  }

  getAdminPaginatedProducts(
    params: GetAdminPaginatedProductsQueryDto,
  ): Promise<PaginatedAdminProductsResult> {
    const searchParams = new URLSearchParams();
    if (params.categoryId) searchParams.set('categoryId', params.categoryId);
    if (params.vendorId) searchParams.set('vendorId', params.vendorId);
    if (params.appearance) searchParams.set('appearance', params.appearance);
    if (params.search) searchParams.set('search', params.search);
    if (params.deleted !== undefined) searchParams.set('deleted', String(params.deleted));
    if (params.blocked !== undefined) searchParams.set('blocked', String(params.blocked));
    if (params.cursor) searchParams.set('cursor', params.cursor);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.direction) searchParams.set('direction', params.direction);
    if (params.sort) searchParams.set('sort', params.sort);
    const qs = searchParams.toString();
    return http.get<PaginatedAdminProductsResult>(`/product/admin/all${qs ? `?${qs}` : ''}`);
  }

  getMyPaginatedProducts(
    params: GetMyPaginatedProductsQueryDto,
  ): Promise<PaginatedAdminProductsResult> {
    const searchParams = new URLSearchParams();
    if (params.categoryId) searchParams.set('categoryId', params.categoryId);
    if (params.appearance) searchParams.set('appearance', params.appearance);
    if (params.search) searchParams.set('search', params.search);
    if (params.cursor) searchParams.set('cursor', params.cursor);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.direction) searchParams.set('direction', params.direction);
    if (params.sort) searchParams.set('sort', params.sort);
    const qs = searchParams.toString();
    return http.get<PaginatedAdminProductsResult>(`/product/vendor/all${qs ? `?${qs}` : ''}`);
  }

  createMyProduct(data: CreateMyProductDto): Promise<ProductMutationResult> {
    return http.post<ProductMutationResult>('/product/vendor', data);
  }

  softDeleteMyProduct(data: softDeleteMyProductDtoType): Promise<ProductMutationResult> {
    return http.delete<ProductMutationResult>('/product/vendor', data);
  }

  recoverMyProduct(data: recoverProductDtoType): Promise<ProductMutationResult> {
    return http.patch<ProductMutationResult>('/product/vendor/recover', data);
  }

  blockProduct(data: blockProductDtoType): Promise<ProductMutationResult> {
    return http.patch<ProductMutationResult>('/product/admin/block', data);
  }

  unBlockProduct(data: blockLiftProductDtoType): Promise<ProductMutationResult> {
    return http.patch<ProductMutationResult>('/product/admin/block/lift', data);
  }

  makeMyProductPublic(data: productAppereanceDtoType): Promise<ProductMutationResult> {
    return http.patch<ProductMutationResult>('/product/vendor/state/public', data);
  }

  makeMyProductPrivate(data: productAppereanceDtoType): Promise<ProductMutationResult> {
    return http.patch<ProductMutationResult>('/product/vendor/state/private', data);
  }

  updateMyProductMeta(data: updateProductMetaDtoType): Promise<ProductMutationResult> {
    return http.patch<ProductMutationResult>('/product/vendor/meta', data);
  }

  toggleMyProductDisclaimer(data: toggleDiscalimerDtoType): Promise<ProductMutationResult> {
    return http.patch<ProductMutationResult>('/product/vendor/disclaimer/toggle', data);
  }

  addMyProductDisclaimers(data: disclaimerItemsDtoType): Promise<ProductMutationResult> {
    return http.patch<ProductMutationResult>('/product/vendor/disclaimer/add', data);
  }

  removeMyProductDisclaimers(data: disclaimerItemsDtoType): Promise<ProductMutationResult> {
    return http.patch<ProductMutationResult>('/product/vendor/disclaimer/remove', data);
  }

  addMyProductImages(data: imagesDtoType): Promise<ProductMutationResult> {
    return http.patch<ProductMutationResult>('/product/vendor/images/add', data);
  }

  setMyProductDefaultImage(data: deafultImageDtoType): Promise<ProductMutationResult> {
    return http.patch<ProductMutationResult>('/product/vendor/images/default', data);
  }

  removeMyProductImages(data: imagesDtoType): Promise<ProductMutationResult> {
    return http.patch<ProductMutationResult>('/product/vendor/images/remove', data);
  }

  toggleMyProductIngredients(data: toggleIngredientsDtoType): Promise<ProductMutationResult> {
    return http.patch<ProductMutationResult>('/product/vendor/ingredients/toggle', data);
  }

  addMyProductIngredients(data: ingredientsDtotype): Promise<ProductMutationResult> {
    return http.patch<ProductMutationResult>('/product/vendor/ingredients/add', data);
  }

  removeMyProductIngredients(data: ingredientsDtotype): Promise<ProductMutationResult> {
    return http.patch<ProductMutationResult>('/product/vendor/ingredients/remove', data);
  }
}

export const productService = new ProductService();
