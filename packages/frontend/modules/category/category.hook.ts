// category.hook.ts

import {
  createCategoryDto,
  type createCategoryDtoType,
  deleteCategoryDto,
  type deleteCategoryType,
  type GetAdminPaginatedCategoriesDto,
  getAdminPaginatedCategoriesSchema,
  getPaginatedDto,
  type getPaginatedDtoType,
  updateCategoryDto,
  type updateCategoryType,
} from '@ecomerece/shared';
import {
  type QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { type CategoryMutationResult, categoryService } from './category.service';

export const CATEGORY_QUERY_KEY = ['categories'];

// ── Queries ─────────────────────────────────────────────────────────────────

export function useGetCategoryById(id: string) {
  return useQuery({
    queryKey: [...CATEGORY_QUERY_KEY, id],
    queryFn: () => categoryService.getCategoryById(id),
    enabled: Boolean(id),
  });
}

export function useGetPaginatedCategories(params: getPaginatedDtoType) {
  return useQuery({
    queryKey: [...CATEGORY_QUERY_KEY, 'paginated', params],
    queryFn: () => categoryService.getPaginatedCategories(getPaginatedDto.parse(params)),
  });
}

export function useGetAdminPaginatedCategories(params: GetAdminPaginatedCategoriesDto) {
  return useQuery({
    queryKey: [...CATEGORY_QUERY_KEY, 'admin-paginated', params],
    queryFn: () =>
      categoryService.getAdminPaginatedCategories(getAdminPaginatedCategoriesSchema.parse(params)),
  });
}

export interface AdminCategoriesInfiniteFilters {
  search?: string;
  deleted?: boolean;
  blocked?: boolean;
  limit?: number;
}

/** Infinite-scroll feed for the admin categories page. Cursor-based (`nextCursor`). */
export function useGetAdminCategoriesInfinite(filters: AdminCategoriesInfiniteFilters = {}) {
  const { limit = 30, ...rest } = filters;
  return useInfiniteQuery({
    queryKey: [...CATEGORY_QUERY_KEY, 'admin-infinite', filters],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      categoryService.getAdminPaginatedCategories({
        ...rest,
        limit,
        cursor: pageParam,
        direction: 'next',
      }),
    getNextPageParam: (lastPage) => lastPage.meta.nextCursor ?? undefined,
    staleTime: 1000 * 60,
  });
}

// ── Shared cache-update helper ───────────────────────────────────────────────

/**
 * Updates cache directly when `updatedData` is returned, otherwise invalidates category queries.
 */
function applyCategoryMutationResult(queryClient: QueryClient, result: CategoryMutationResult) {
  const updated = result.updatedData;

  if (!updated) {
    queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEY });
    return;
  }

  queryClient.setQueryData([...CATEGORY_QUERY_KEY, updated.id], updated);
  queryClient.invalidateQueries({ queryKey: [...CATEGORY_QUERY_KEY, 'paginated'] });
}

// ── Mutations ───────────────────────────────────────────────────────────────

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: createCategoryDtoType) =>
      categoryService.createCategory(createCategoryDto.parse(data)),
    onSuccess: (data) => applyCategoryMutationResult(queryClient, data),
  });
}

export function useDeleteCategoryById() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: deleteCategoryType) =>
      categoryService.deleteCategoryById(deleteCategoryDto.parse(data)),
    onSuccess: (data) => applyCategoryMutationResult(queryClient, data),
  });
}

export function useUpdateCategoryImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: updateCategoryType) =>
      categoryService.updateCategory(updateCategoryDto.parse(data)),
    onSuccess: (data) => applyCategoryMutationResult(queryClient, data),
  });
}
