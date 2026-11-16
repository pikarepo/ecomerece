// returns.hook.ts

import {
  createReturnDto,
  type createReturnDtoType,
  getAdminReturnsQuerySchema,
  type GetAdminReturnsQueryDto,
  getMyReturnsQuerySchema,
  type GetMyReturnsQueryDto,
  getVendorReturnsQuerySchema,
  type GetVendorReturnsQueryDto,
  returnDecisionDto,
  type returnDecisionDtoType,
} from '@ecomerece/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { returnsService } from './returns.service';

export const RETURNS_QUERY_KEY = ['returns'];

function invalidateReturns(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: RETURNS_QUERY_KEY });
}

type IdAndData<TData> = { id: string; data: TData };

// ── Queries ────────────────────────────────────────────────────────────────

export function useGetMyReturns(params: GetMyReturnsQueryDto) {
  return useQuery({
    queryKey: [...RETURNS_QUERY_KEY, 'my', params],
    queryFn: () => returnsService.getMyReturns(getMyReturnsQuerySchema.parse(params)),
  });
}

export function useGetMyReturnById(id: string) {
  return useQuery({
    queryKey: [...RETURNS_QUERY_KEY, 'my', id],
    queryFn: () => returnsService.getMyReturnById(id),
    enabled: !!id,
  });
}

export function useGetVendorReturns(params: GetVendorReturnsQueryDto) {
  return useQuery({
    queryKey: [...RETURNS_QUERY_KEY, 'vendor', params],
    queryFn: () => returnsService.getVendorReturns(getVendorReturnsQuerySchema.parse(params)),
  });
}

export function useGetVendorReturnById(id: string) {
  return useQuery({
    queryKey: [...RETURNS_QUERY_KEY, 'vendor', id],
    queryFn: () => returnsService.getVendorReturnById(id),
    enabled: !!id,
  });
}

export function useGetAdminReturns(params: GetAdminReturnsQueryDto) {
  return useQuery({
    queryKey: [...RETURNS_QUERY_KEY, 'admin', params],
    queryFn: () => returnsService.getAdminReturns(getAdminReturnsQuerySchema.parse(params)),
  });
}

export function useGetAdminReturnById(id: string) {
  return useQuery({
    queryKey: [...RETURNS_QUERY_KEY, 'admin', id],
    queryFn: () => returnsService.getAdminReturnById(id),
    enabled: !!id,
  });
}

// ── Buyer mutations ────────────────────────────────────────────────────────

export function useCreateMyReturn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: createReturnDtoType) =>
      returnsService.createMyReturn(createReturnDto.parse(data)),
    onSuccess: () => invalidateReturns(queryClient),
  });
}

export function useCancelMyReturn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: IdAndData<returnDecisionDtoType>) =>
      returnsService.cancelMyReturn(id, returnDecisionDto.parse(data)),
    onSuccess: () => invalidateReturns(queryClient),
  });
}

// ── Vendor mutations ───────────────────────────────────────────────────────

export function useApproveVendorReturn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => returnsService.approveVendorReturn(id),
    onSuccess: () => invalidateReturns(queryClient),
  });
}

export function useRejectVendorReturn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: IdAndData<returnDecisionDtoType>) =>
      returnsService.rejectVendorReturn(id, returnDecisionDto.parse(data)),
    onSuccess: () => invalidateReturns(queryClient),
  });
}

export function useShippedBackVendorReturn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => returnsService.shippedBackVendorReturn(id),
    onSuccess: () => invalidateReturns(queryClient),
  });
}

export function useReceivedVendorReturn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => returnsService.receivedVendorReturn(id),
    onSuccess: () => invalidateReturns(queryClient),
  });
}

// ── Admin mutations ────────────────────────────────────────────────────────

export function useApproveAdminReturn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => returnsService.approveAdminReturn(id),
    onSuccess: () => invalidateReturns(queryClient),
  });
}

export function useRejectAdminReturn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: IdAndData<returnDecisionDtoType>) =>
      returnsService.rejectAdminReturn(id, returnDecisionDto.parse(data)),
    onSuccess: () => invalidateReturns(queryClient),
  });
}

export function useShippedBackAdminReturn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => returnsService.shippedBackAdminReturn(id),
    onSuccess: () => invalidateReturns(queryClient),
  });
}

export function useReceivedAdminReturn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => returnsService.receivedAdminReturn(id),
    onSuccess: () => invalidateReturns(queryClient),
  });
}

export function useCancelAdminReturn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: IdAndData<returnDecisionDtoType>) =>
      returnsService.cancelAdminReturn(id, returnDecisionDto.parse(data)),
    onSuccess: () => invalidateReturns(queryClient),
  });
}

export function useDeleteAdminReturn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: IdAndData<returnDecisionDtoType>) =>
      returnsService.deleteAdminReturn(id, returnDecisionDto.parse(data)),
    onSuccess: () => invalidateReturns(queryClient),
  });
}

export function useRecoverAdminReturn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => returnsService.recoverAdminReturn(id),
    onSuccess: () => invalidateReturns(queryClient),
  });
}
