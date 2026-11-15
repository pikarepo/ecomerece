// order-request.hook.ts

import {
  type AcceptOrderRequestDto,
  type CreateOrderRequestDto,
  type GetAdminOrderRequestsQueryDto,
  type GetMyOrderRequestsQueryDto,
  type GetVendorOrderRequestsQueryDto,
  getAdminOrderRequestsQuerySchema,
  getMyOrderRequestsQuerySchema,
  getVendorOrderRequestsQuerySchema,
  type RejectOrderRequestDto,
} from '@ecomerece/shared';
import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderRequestService } from './order-request.service';

export const ORDER_REQUEST_QUERY_KEY = ['order-requests'];

function invalidateOrderRequests(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ORDER_REQUEST_QUERY_KEY });
}

// Buyer queries
export function useGetMyOrderRequests(params: GetMyOrderRequestsQueryDto) {
  return useQuery({
    queryKey: [...ORDER_REQUEST_QUERY_KEY, 'my', params],
    queryFn: () =>
      orderRequestService.getMyOrderRequests(getMyOrderRequestsQuerySchema.parse(params)),
  });
}

export function useGetMyOrderRequest(id: string) {
  return useQuery({
    queryKey: [...ORDER_REQUEST_QUERY_KEY, 'my', 'one', id],
    queryFn: () => orderRequestService.getMyOrderRequest(id),
    enabled: Boolean(id),
  });
}

// Vendor queries
export function useGetVendorOrderRequests(params: GetVendorOrderRequestsQueryDto) {
  return useQuery({
    queryKey: [...ORDER_REQUEST_QUERY_KEY, 'vendor', params],
    queryFn: () =>
      orderRequestService.getVendorOrderRequests(getVendorOrderRequestsQuerySchema.parse(params)),
  });
}

export function useGetVendorOrderRequest(id: string) {
  return useQuery({
    queryKey: [...ORDER_REQUEST_QUERY_KEY, 'vendor', 'one', id],
    queryFn: () => orderRequestService.getVendorOrderRequest(id),
    enabled: Boolean(id),
  });
}

// Admin queries
export function useGetAdminOrderRequests(params: GetAdminOrderRequestsQueryDto) {
  return useQuery({
    queryKey: [...ORDER_REQUEST_QUERY_KEY, 'admin', params],
    queryFn: () =>
      orderRequestService.getAdminOrderRequests(getAdminOrderRequestsQuerySchema.parse(params)),
  });
}

export function useGetAdminOrderRequest(id: string) {
  return useQuery({
    queryKey: [...ORDER_REQUEST_QUERY_KEY, 'admin', 'one', id],
    queryFn: () => orderRequestService.getAdminOrderRequest(id),
    enabled: Boolean(id),
  });
}

// Buyer mutations
export function useCreateMyOrderRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrderRequestDto) => orderRequestService.createMyOrderRequest(data),
    onSuccess: () => invalidateOrderRequests(queryClient),
  });
}

export function useCancelMyOrderRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => orderRequestService.cancelMyOrderRequest(id),
    onSuccess: () => invalidateOrderRequests(queryClient),
  });
}

// Vendor mutations
export function useAcceptVendorOrderRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AcceptOrderRequestDto }) =>
      orderRequestService.acceptVendorOrderRequest(id, data),
    onSuccess: () => invalidateOrderRequests(queryClient),
  });
}

export function useRejectVendorOrderRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectOrderRequestDto }) =>
      orderRequestService.rejectVendorOrderRequest(id, data),
    onSuccess: () => invalidateOrderRequests(queryClient),
  });
}

// Admin mutations
export function useAcceptAdminOrderRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AcceptOrderRequestDto }) =>
      orderRequestService.acceptAdminOrderRequest(id, data),
    onSuccess: () => invalidateOrderRequests(queryClient),
  });
}

export function useRejectAdminOrderRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectOrderRequestDto }) =>
      orderRequestService.rejectAdminOrderRequest(id, data),
    onSuccess: () => invalidateOrderRequests(queryClient),
  });
}

export function useCancelAdminOrderRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => orderRequestService.cancelAdminOrderRequest(id),
    onSuccess: () => invalidateOrderRequests(queryClient),
  });
}
