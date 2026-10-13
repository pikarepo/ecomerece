// review.hook.ts

import {
  createMyReviewDtoSchema,
  type createMyReviewDtoType,
  type GetAdminPaginatedReviewsQueryDto,
  type GetPaginatedReviewsQueryDto,
  getAdminPaginatedReviewsQuerySchema,
  getPaginatedReviewsQuerySchema,
} from '@ecomerece/shared';
import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type ReviewMutationResult, reviewService } from './review.service';

export const REVIEW_QUERY_KEY = ['reviews'];

// ── Queries ─────────────────────────────────────────────────────────────────

export function useGetReviewById(id: string) {
  return useQuery({
    queryKey: [...REVIEW_QUERY_KEY, id],
    queryFn: () => reviewService.getReviewById(id),
    enabled: Boolean(id),
  });
}

export function useGetReviewsByProductId(productId: string) {
  return useQuery({
    queryKey: [...REVIEW_QUERY_KEY, 'product', productId],
    queryFn: () => reviewService.getReviewsByProductId(productId),
    enabled: Boolean(productId),
  });
}

export function useGetPaginatedReviews(params: GetPaginatedReviewsQueryDto) {
  return useQuery({
    queryKey: [...REVIEW_QUERY_KEY, 'paginated', params],
    queryFn: () => reviewService.getPaginatedReviews(getPaginatedReviewsQuerySchema.parse(params)),
  });
}

export function useGetAdminPaginatedReviews(params: GetAdminPaginatedReviewsQueryDto) {
  return useQuery({
    queryKey: [...REVIEW_QUERY_KEY, 'admin-paginated', params],
    queryFn: () =>
      reviewService.getAdminPaginatedReviews(getAdminPaginatedReviewsQuerySchema.parse(params)),
  });
}

// ── Shared cache-update helper ───────────────────────────────────────────────

function applyReviewMutationResult(queryClient: QueryClient, result: ReviewMutationResult) {
  const updated = result.updatedData;

  if (!updated) {
    queryClient.invalidateQueries({ queryKey: REVIEW_QUERY_KEY });
    return;
  }

  queryClient.setQueryData([...REVIEW_QUERY_KEY, updated._id], updated);
  queryClient.invalidateQueries({
    queryKey: [...REVIEW_QUERY_KEY, 'product', updated.productId],
  });
}

// ── Mutations ───────────────────────────────────────────────────────────────

export function useCreateMyReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: createMyReviewDtoType) =>
      reviewService.createMyReview(createMyReviewDtoSchema.parse(data)),
    onSuccess: (data) => applyReviewMutationResult(queryClient, data),
  });
}
