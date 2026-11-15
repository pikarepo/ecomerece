// order-items.hook.ts

import {
  cancelMyOrderItemsDto,
  deleteOrderItemDto,
  type GetAdminPaginatedOrderItemsQueryDto,
  type GetVendorPaginatedOrderItemsQueryDto,
  getAdminPaginatedOrderItemsQuerySchema,
  getVendorPaginatedOrderItemsQuerySchema,
  type UpdateOrderItemDto,
} from '@ecomerece/shared';
import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderItemsService } from './order-items.service';

export const ORDER_ITEMS_QUERY_KEY = ['order-items'];

function invalidateOrderItems(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ORDER_ITEMS_QUERY_KEY });
}

// Buyer queries
export function useGetMyOrderItems(orderId: string) {
  return useQuery({
    queryKey: [...ORDER_ITEMS_QUERY_KEY, 'my', orderId],
    queryFn: () => orderItemsService.getMyOrderItems(orderId),
    enabled: Boolean(orderId),
  });
}

// Vendor queries
export function useGetVendorPaginatedOrderItems(params: GetVendorPaginatedOrderItemsQueryDto) {
  return useQuery({
    queryKey: [...ORDER_ITEMS_QUERY_KEY, 'vendor', params],
    queryFn: () =>
      orderItemsService.getVendorPaginatedOrderItems(
        getVendorPaginatedOrderItemsQuerySchema.parse(params),
      ),
  });
}

export function useGetVendorOrderItem(id: string) {
  return useQuery({
    queryKey: [...ORDER_ITEMS_QUERY_KEY, 'vendor', 'one', id],
    queryFn: () => orderItemsService.getVendorOrderItem(id),
    enabled: Boolean(id),
  });
}

// Admin queries
export function useGetAdminPaginatedOrderItems(params: GetAdminPaginatedOrderItemsQueryDto) {
  return useQuery({
    queryKey: [...ORDER_ITEMS_QUERY_KEY, 'admin', 'paginated', params],
    queryFn: () =>
      orderItemsService.getAdminPaginatedOrderItems(
        getAdminPaginatedOrderItemsQuerySchema.parse(params),
      ),
  });
}

export function useGetAdminOrderItem(id: string) {
  return useQuery({
    queryKey: [...ORDER_ITEMS_QUERY_KEY, 'admin', 'one', id],
    queryFn: () => orderItemsService.getAdminOrderItem(id),
    enabled: Boolean(id),
  });
}

// Buyer mutations
export function useCancelMyOrderItems() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof cancelMyOrderItemsDto.parse>[0]) =>
      orderItemsService.cancelMyOrderItems(cancelMyOrderItemsDto.parse(data)),
    onSuccess: () => invalidateOrderItems(queryClient),
  });
}

// Vendor mutations
export function useUpdateVendorOrderItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderItemDto }) =>
      orderItemsService.updateVendorOrderItem(id, data),
    onSuccess: () => invalidateOrderItems(queryClient),
  });
}

export function useVendorOrderItemCommand(command: 'confirm' | 'complete' | 'return' | 'refund') {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      switch (command) {
        case 'confirm':
          return orderItemsService.confirmVendorOrderItem(id);
        case 'complete':
          return orderItemsService.completeVendorOrderItem(id);
        case 'return':
          return orderItemsService.returnVendorOrderItem(id);
        case 'refund':
          return orderItemsService.refundVendorOrderItem(id);
      }
    },
    onSuccess: () => invalidateOrderItems(queryClient),
  });
}

// Admin mutations
export function useUpdateAdminOrderItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderItemDto }) =>
      orderItemsService.updateAdminOrderItem(id, data),
    onSuccess: () => invalidateOrderItems(queryClient),
  });
}

export function useDeleteAdminOrderItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof deleteOrderItemDto.parse>[0];
    }) => orderItemsService.deleteAdminOrderItem(id, deleteOrderItemDto.parse(data)),
    onSuccess: () => invalidateOrderItems(queryClient),
  });
}

export function useRecoverAdminOrderItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => orderItemsService.recoverAdminOrderItem(id),
    onSuccess: () => invalidateOrderItems(queryClient),
  });
}

export function useAdminOrderItemCommand(command: 'confirm' | 'complete' | 'return' | 'refund') {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      switch (command) {
        case 'confirm':
          return orderItemsService.confirmAdminOrderItem(id);
        case 'complete':
          return orderItemsService.completeAdminOrderItem(id);
        case 'return':
          return orderItemsService.returnAdminOrderItem(id);
        case 'refund':
          return orderItemsService.refundAdminOrderItem(id);
      }
    },
    onSuccess: () => invalidateOrderItems(queryClient),
  });
}
