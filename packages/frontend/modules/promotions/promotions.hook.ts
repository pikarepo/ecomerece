// promotions.hook.ts

import {
  couponReasonDto,
  type couponReasonDtoType,
  createCouponDto,
  type createCouponDtoType,
  getAdminCouponsQuerySchema,
  type GetAdminCouponsQueryDto,
  updateCouponDto,
  type updateCouponDtoType,
  validateCouponDto,
  type validateCouponDtoType,
} from '@ecomerece/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { promotionsService } from './promotions.service';

export const PROMOTIONS_QUERY_KEY = ['promotions'];

function invalidateCoupons(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: PROMOTIONS_QUERY_KEY });
}

type IdAndData<TData> = { id: string; data: TData };

// ── Queries ────────────────────────────────────────────────────────────────

export function useGetAdminCoupons(params: GetAdminCouponsQueryDto) {
  return useQuery({
    queryKey: [...PROMOTIONS_QUERY_KEY, 'admin', params],
    queryFn: () => promotionsService.getAdminCoupons(getAdminCouponsQuerySchema.parse(params)),
  });
}

export function useGetAdminCouponById(id: string) {
  return useQuery({
    queryKey: [...PROMOTIONS_QUERY_KEY, 'admin', id],
    queryFn: () => promotionsService.getAdminCouponById(id),
    enabled: !!id,
  });
}

// ── Mutations ──────────────────────────────────────────────────────────────

export function useValidateCoupon() {
  return useMutation({
    mutationFn: (data: validateCouponDtoType) =>
      promotionsService.validateCoupon(validateCouponDto.parse(data)),
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: createCouponDtoType) =>
      promotionsService.createCoupon(createCouponDto.parse(data)),
    onSuccess: () => invalidateCoupons(queryClient),
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: IdAndData<updateCouponDtoType>) =>
      promotionsService.updateCoupon(id, updateCouponDto.parse(data)),
    onSuccess: () => invalidateCoupons(queryClient),
  });
}

export function useActivateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => promotionsService.activateCoupon(id),
    onSuccess: () => invalidateCoupons(queryClient),
  });
}

export function useDeactivateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => promotionsService.deactivateCoupon(id),
    onSuccess: () => invalidateCoupons(queryClient),
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: IdAndData<couponReasonDtoType>) =>
      promotionsService.deleteCoupon(id, couponReasonDto.parse(data)),
    onSuccess: () => invalidateCoupons(queryClient),
  });
}

export function useRecoverCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => promotionsService.recoverCoupon(id),
    onSuccess: () => invalidateCoupons(queryClient),
  });
}
