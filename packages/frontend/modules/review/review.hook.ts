// review.hook.ts

import {
  addVendorReplyDto,
  type addVendorReplyDtoType,
  blockReviewDto,
  type blockReviewDtoType,
  createMyReviewDtoSchema,
  type createMyReviewDtoType,
  deleteMyReviewDto,
  type deleteMyReviewDtoType,
  type GetAdminPaginatedReviewsQueryDto,
  type GetPaginatedReviewsQueryDto,
  getAdminPaginatedReviewsQuerySchema,
  getPaginatedReviewsQuerySchema,
  reportReviewDto,
  type reportReviewDtoType,
  updateMyReviewDto,
  type updateMyReviewDtoType,
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

// ── Buyer ───────────────────────────────────────────────────────────────────

export function useGetMyPaginatedReviews(params: GetPaginatedReviewsQueryDto) {
  return useQuery({
    queryKey: [...REVIEW_QUERY_KEY, 'my', params],
    queryFn: () =>
      reviewService.getMyPaginatedReviews(getPaginatedReviewsQuerySchema.parse(params)),
  });
}

export function useUpdateMyReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: updateMyReviewDtoType }) =>
      reviewService.updateMyReview(id, updateMyReviewDto.parse(data)),
    onSuccess: (data) => applyReviewMutationResult(queryClient, data),
  });
}

export function useDeleteMyReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: deleteMyReviewDtoType }) =>
      reviewService.deleteMyReview(id, deleteMyReviewDto.parse(data)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: REVIEW_QUERY_KEY }),
  });
}

export function useLikeReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reviewService.likeReview(id),
    onSuccess: (data) => applyReviewMutationResult(queryClient, data),
  });
}

export function useDislikeReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reviewService.dislikeReview(id),
    onSuccess: (data) => applyReviewMutationResult(queryClient, data),
  });
}

export function useReportReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: reportReviewDtoType }) =>
      reviewService.reportReview(id, reportReviewDto.parse(data)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: REVIEW_QUERY_KEY }),
  });
}

// ── Vendor ──────────────────────────────────────────────────────────────────

export function useGetVendorPaginatedReviews(params: GetPaginatedReviewsQueryDto) {
  return useQuery({
    queryKey: [...REVIEW_QUERY_KEY, 'vendor', params],
    queryFn: () =>
      reviewService.getVendorPaginatedReviews(getPaginatedReviewsQuerySchema.parse(params)),
  });
}

export function useReplyToReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: addVendorReplyDtoType }) =>
      reviewService.replyToReview(id, addVendorReplyDto.parse(data)),
    onSuccess: (data) => applyReviewMutationResult(queryClient, data),
  });
}

// ── Admin ───────────────────────────────────────────────────────────────────

export function useBlockReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: blockReviewDtoType }) =>
      reviewService.blockReview(id, blockReviewDto.parse(data)),
    onSuccess: (data) => applyReviewMutationResult(queryClient, data),
  });
}

export function useUnblockReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reviewService.unblockReview(id),
    onSuccess: (data) => applyReviewMutationResult(queryClient, data),
  });
}
