// promotions.service.ts

import type {
  CouponListItemResponseReadModel,
  CouponResponseReadModel,
  CouponValidationResponseReadModel,
  couponReasonDtoType,
  createCouponDtoType,
  GetAdminCouponsQueryDto,
  updateCouponDtoType,
  validateCouponDtoType,
} from '@ecomerece/shared';
import { http } from './../../lib';

export type CouponMutationResult = {
  message: string;
  updatedData?: CouponResponseReadModel;
};

export type PaginatedCouponsResult = {
  data: CouponListItemResponseReadModel[];
  meta: {
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
  };
};

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') searchParams.set(key, String(value));
  }

  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

export class PromotionsService {
  /** Buyer preview: returns `valid: false` with a reason instead of throwing. */
  validateCoupon(data: validateCouponDtoType): Promise<CouponValidationResponseReadModel> {
    return http.post<CouponValidationResponseReadModel>('/promotion/validate', data);
  }

  getAdminCoupons(params: GetAdminCouponsQueryDto): Promise<PaginatedCouponsResult> {
    return http.get<PaginatedCouponsResult>(
      `/promotion/admin/all${buildQuery({
        code: params.code,
        active: params.active,
        deleted: params.deleted,
        cursor: params.cursor,
        limit: params.limit,
        direction: params.direction,
      })}`,
    );
  }

  createCoupon(data: createCouponDtoType): Promise<CouponMutationResult> {
    return http.post<CouponMutationResult>('/promotion/admin', data);
  }

  getAdminCouponById(id: string): Promise<CouponResponseReadModel> {
    return http.get<CouponResponseReadModel>(`/promotion/admin/${id}`);
  }

  updateCoupon(id: string, data: updateCouponDtoType): Promise<CouponMutationResult> {
    return http.patch<CouponMutationResult>(`/promotion/admin/${id}`, data);
  }

  activateCoupon(id: string): Promise<CouponMutationResult> {
    return http.post<CouponMutationResult>(`/promotion/admin/${id}/activate`, {});
  }

  deactivateCoupon(id: string): Promise<CouponMutationResult> {
    return http.post<CouponMutationResult>(`/promotion/admin/${id}/deactivate`, {});
  }

  deleteCoupon(id: string, data: couponReasonDtoType): Promise<CouponMutationResult> {
    return http.delete<CouponMutationResult>(`/promotion/admin/${id}`, data);
  }

  recoverCoupon(id: string): Promise<CouponMutationResult> {
    return http.patch<CouponMutationResult>(`/promotion/admin/${id}/recover`);
  }
}

export const promotionsService = new PromotionsService();
