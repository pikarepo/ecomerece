// order.hook.ts

import {
  type buyNowOrderDtoType,
  buyNowOrderDto,
  createMyOrderDto,
  type createMyOrderDtoType,
  type GetAdminPaginatedOrdersQueryDto,
  type GetMyOrdersQueryDto,
  type GetVendorPaginatedOrdersQueryDto,
  getAdminPaginatedOrdersQuerySchema,
  getMyOrdersQuerySchema,
  getVendorPaginatedOrdersQuerySchema,
  type orderReasonDtoType,
  orderReasonDto,
  type OrderResponseReadModel,
  type updateOrderDtoType,
  updateOrderDto,
} from '@ecomerece/shared';
import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type OrderMutationResult, orderService } from './order.service';

export const ORDER_QUERY_KEY = ['orders'];

// ── Queries ─────────────────────────────────────────────────────────────────

export function useGetMyOrders(params: GetMyOrdersQueryDto) {
  return useQuery({
    queryKey: [...ORDER_QUERY_KEY, 'me', params],
    queryFn: () => orderService.getMyOrders(getMyOrdersQuerySchema.parse(params)),
  });
}

export function useGetAdminPaginatedOrders(params: GetAdminPaginatedOrdersQueryDto) {
  return useQuery({
    queryKey: [...ORDER_QUERY_KEY, 'admin-paginated', params],
    queryFn: () =>
      orderService.getAdminPaginatedOrders(getAdminPaginatedOrdersQuerySchema.parse(params)),
  });
}

// ── Shared cache-update helper ───────────────────────────────────────────────

function applyOrderMutationResult(queryClient: QueryClient, result: OrderMutationResult) {
  const updated = result.updatedData;

  if (!updated) {
    queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEY });
    return;
  }

  queryClient.setQueryData([...ORDER_QUERY_KEY, updated.id], updated);
  queryClient.invalidateQueries({ queryKey: [...ORDER_QUERY_KEY, 'me'] });
}

// ── Mutations ───────────────────────────────────────────────────────────────

export function useCreateMyOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: createMyOrderDtoType) =>
      orderService.createMyOrder(createMyOrderDto.parse(data)),
    onSuccess: (data) => applyOrderMutationResult(queryClient, data),
  });
}

export function useBuyNow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: buyNowOrderDtoType) => orderService.buyNow(buyNowOrderDto.parse(data)),
    onSuccess: (data) => applyOrderMutationResult(queryClient, data),
  });
}

export function useGetMyOrder(id: string) {
  return useQuery({
    queryKey: [...ORDER_QUERY_KEY, 'my', 'one', id],
    queryFn: () => orderService.getMyOrderById(id),
    enabled: Boolean(id),
  });
}

export function useCancelMyOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: orderReasonDtoType }) =>
      orderService.cancelMyOrder(id, orderReasonDto.parse(data)),
    onSuccess: (data) => applyOrderMutationResult(queryClient, data),
  });
}

export function useRetryMyOrderItems() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => orderService.retryMyOrderItems(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEY }),
  });
}

export function useRetryMyOrderItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => orderService.retryMyOrderItem(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEY }),
  });
}

// ── Vendor ──────────────────────────────────────────────────────────────────

export function useGetVendorPaginatedOrders(params: GetVendorPaginatedOrdersQueryDto) {
  return useQuery({
    queryKey: [...ORDER_QUERY_KEY, 'vendor', 'paginated', params],
    queryFn: () =>
      orderService.getVendorPaginatedOrders(getVendorPaginatedOrdersQuerySchema.parse(params)),
  });
}

export function useGetVendorOrder(id: string) {
  return useQuery({
    queryKey: [...ORDER_QUERY_KEY, 'vendor', 'one', id],
    queryFn: () => orderService.getVendorOrderById(id),
    enabled: Boolean(id),
  });
}

export function useVendorOrderCommand(command: 'confirm' | 'complete') {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      command === 'confirm'
        ? orderService.confirmVendorOrder(id)
        : orderService.completeVendorOrder(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEY }),
  });
}

export function useVendorOrderReasonCommand(command: 'return' | 'refund') {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: orderReasonDtoType }) =>
      command === 'return'
        ? orderService.returnVendorOrder(id, orderReasonDto.parse(data))
        : orderService.refundVendorOrder(id, orderReasonDto.parse(data)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEY }),
  });
}

// ── Admin ───────────────────────────────────────────────────────────────────

export function useGetAdminOrder(id: string) {
  return useQuery({
    queryKey: [...ORDER_QUERY_KEY, 'admin', 'one', id],
    queryFn: () => orderService.getAdminOrderById(id),
    enabled: Boolean(id),
  });
}

export function useUpdateAdminOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: updateOrderDtoType }) =>
      orderService.updateAdminOrder(id, updateOrderDto.parse(data)),
    onSuccess: (data) => applyOrderMutationResult(queryClient, data),
  });
}

export function useDeleteAdminOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: orderReasonDtoType }) =>
      orderService.deleteAdminOrder(id, orderReasonDto.parse(data)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEY }),
  });
}

export function useRecoverAdminOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => orderService.recoverAdminOrder(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEY }),
  });
}

export function useAdminOrderCommand(command: 'confirm' | 'complete') {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      command === 'confirm'
        ? orderService.confirmAdminOrder(id)
        : orderService.completeAdminOrder(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEY }),
  });
}

export function useCancelAdminOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: orderReasonDtoType }) =>
      orderService.cancelAdminOrder(id, orderReasonDto.parse(data)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEY }),
  });
}

export function useAdminOrderReasonCommand(command: 'return' | 'refund') {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: orderReasonDtoType }) =>
      command === 'return'
        ? orderService.returnAdminOrder(id, orderReasonDto.parse(data))
        : orderService.refundAdminOrder(id, orderReasonDto.parse(data)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEY }),
  });
}
