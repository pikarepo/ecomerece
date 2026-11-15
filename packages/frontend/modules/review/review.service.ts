// review.service.ts

import type {
  addVendorReplyDtoType,
  blockReviewDtoType,
  createMyReviewDtoType,
  deleteMyReviewDtoType,
  GetAdminPaginatedReviewsQueryDto,
  GetPaginatedReviewsQueryDto,
  reportReviewDtoType,
  ReviewResponseReadModel,
  updateMyReviewDtoType,
} from '@ecomerece/shared';
import { http } from './../../lib';

export type ReviewMutationResult = {
  message: string;
  updatedData?: ReviewResponseReadModel;
};

export type PaginatedReviewsResult = {
  data: ReviewResponseReadModel[];
  meta: {
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
  };
};

export class ReviewService {
  getReviewById(id: string): Promise<ReviewResponseReadModel> {
    return http.get<ReviewResponseReadModel>(`/review/${id}`);
  }

  getReviewsByProductId(productId: string): Promise<ReviewResponseReadModel[]> {
    return http.get<ReviewResponseReadModel[]>(`/review/product/${productId}`);
  }

  getPaginatedReviews(params: GetPaginatedReviewsQueryDto): Promise<PaginatedReviewsResult> {
    const searchParams = new URLSearchParams();
    if (params.productId) searchParams.set('productId', params.productId);
    if (params.rating !== undefined) searchParams.set('rating', String(params.rating));
    if (params.cursor) searchParams.set('cursor', params.cursor);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.direction) searchParams.set('direction', params.direction);
    const qs = searchParams.toString();
    return http.get<PaginatedReviewsResult>(`/review${qs ? `?${qs}` : ''}`);
  }

  getAdminPaginatedReviews(
    params: GetAdminPaginatedReviewsQueryDto,
  ): Promise<PaginatedReviewsResult> {
    const searchParams = new URLSearchParams();
    if (params.productId) searchParams.set('productId', params.productId);
    if (params.authorId) searchParams.set('authorId', params.authorId);
    if (params.rating !== undefined) searchParams.set('rating', String(params.rating));
    if (params.deleted !== undefined) searchParams.set('deleted', String(params.deleted));
    if (params.cursor) searchParams.set('cursor', params.cursor);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.direction) searchParams.set('direction', params.direction);
    const qs = searchParams.toString();
    return http.get<PaginatedReviewsResult>(`/review/admin/all${qs ? `?${qs}` : ''}`);
  }

  createMyReview(data: createMyReviewDtoType): Promise<ReviewMutationResult> {
    return http.post<ReviewMutationResult>('/review/my', data);
  }

  // Buyer
  getMyPaginatedReviews(params: GetPaginatedReviewsQueryDto): Promise<PaginatedReviewsResult> {
    const searchParams = new URLSearchParams();
    if (params.productId) searchParams.set('productId', params.productId);
    if (params.rating !== undefined) searchParams.set('rating', String(params.rating));
    if (params.cursor) searchParams.set('cursor', params.cursor);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.direction) searchParams.set('direction', params.direction);
    const qs = searchParams.toString();
    return http.get<PaginatedReviewsResult>(`/review/my${qs ? `?${qs}` : ''}`);
  }

  updateMyReview(id: string, data: updateMyReviewDtoType): Promise<ReviewMutationResult> {
    return http.patch<ReviewMutationResult>(`/review/my/${id}`, data);
  }

  deleteMyReview(id: string, data: deleteMyReviewDtoType): Promise<ReviewMutationResult> {
    return http.delete<ReviewMutationResult>(`/review/my/${id}`, data);
  }

  likeReview(id: string): Promise<ReviewMutationResult> {
    return http.post<ReviewMutationResult>(`/review/my/${id}/like`, {});
  }

  dislikeReview(id: string): Promise<ReviewMutationResult> {
    return http.post<ReviewMutationResult>(`/review/my/${id}/dislike`, {});
  }

  reportReview(id: string, data: reportReviewDtoType): Promise<ReviewMutationResult> {
    return http.post<ReviewMutationResult>(`/review/my/${id}/report`, data);
  }

  // Vendor
  getVendorPaginatedReviews(params: GetPaginatedReviewsQueryDto): Promise<PaginatedReviewsResult> {
    const searchParams = new URLSearchParams();
    if (params.productId) searchParams.set('productId', params.productId);
    if (params.rating !== undefined) searchParams.set('rating', String(params.rating));
    if (params.cursor) searchParams.set('cursor', params.cursor);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.direction) searchParams.set('direction', params.direction);
    const qs = searchParams.toString();
    return http.get<PaginatedReviewsResult>(`/review/vendor/all${qs ? `?${qs}` : ''}`);
  }

  replyToReview(id: string, data: addVendorReplyDtoType): Promise<ReviewMutationResult> {
    return http.post<ReviewMutationResult>(`/review/vendor/${id}/reply`, data);
  }

  // Admin
  blockReview(id: string, data: blockReviewDtoType): Promise<ReviewMutationResult> {
    return http.patch<ReviewMutationResult>(`/review/admin/${id}/block`, data);
  }

  unblockReview(id: string): Promise<ReviewMutationResult> {
    return http.patch<ReviewMutationResult>(`/review/admin/${id}/unblock`);
  }
}

export const reviewService = new ReviewService();
