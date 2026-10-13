// category.service.ts

import type {
  categoryResponseReadModels,
  createCategoryDtoType,
  deleteCategoryType,
  GetAdminPaginatedCategoriesDto,
  getPaginatedDtoType,
  updateCategoryType,
} from '@ecomerece/shared';
import { http } from './../../lib';

export type CategoryMutationResult = {
  message: string;
  updatedData?: categoryResponseReadModels;
};

export type PaginatedCategoriesResult = {
  data: categoryResponseReadModels[];
  meta: {
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
  };
};

export class CategoryService {
  getCategoryById(id: string): Promise<categoryResponseReadModels> {
    return http.get<categoryResponseReadModels>(`/category/${id}`);
  }

  getPaginatedCategories(params: getPaginatedDtoType): Promise<PaginatedCategoriesResult> {
    const searchParams = new URLSearchParams();
    if (params.cursor) searchParams.append('cursor', params.cursor);
    if (params.limit) searchParams.append('limit', String(params.limit));
    if (params.direction) searchParams.append('direction', params.direction);
    if (params.search) searchParams.append('search', params.search);

    const query = searchParams.toString();
    const url = query ? `/category?${query}` : '/category';

    return http.get<PaginatedCategoriesResult>(url);
  }

  getAdminPaginatedCategories(
    params: GetAdminPaginatedCategoriesDto,
  ): Promise<PaginatedCategoriesResult> {
    const searchParams = new URLSearchParams();
    if (params.cursor) searchParams.append('cursor', params.cursor);
    if (params.limit) searchParams.append('limit', String(params.limit));
    if (params.direction) searchParams.append('direction', params.direction);
    if (params.search) searchParams.append('search', params.search);
    if (params.deleted !== undefined) searchParams.append('deleted', String(params.deleted));
    if (params.blocked !== undefined) searchParams.append('blocked', String(params.blocked));

    const query = searchParams.toString();
    const url = query ? `/category/admin/all?${query}` : '/category/admin/all';

    return http.get<PaginatedCategoriesResult>(url);
  }

  createCategory(data: createCategoryDtoType): Promise<CategoryMutationResult> {
    return http.post<CategoryMutationResult>('/category/create', data);
  }

  updateCategory(data: updateCategoryType): Promise<CategoryMutationResult> {
    return http.patch<CategoryMutationResult>('/category/update', data);
  }

  deleteCategoryById(data: deleteCategoryType): Promise<CategoryMutationResult> {
    return http.delete<CategoryMutationResult>('/category', data);
  }
}

export const categoryService = new CategoryService();
