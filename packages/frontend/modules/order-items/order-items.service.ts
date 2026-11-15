// order-items.service.ts

import type {
  CancelMyOrderItemsDto,
  DeleteOrderItemDto,
  GetAdminPaginatedOrderItemsQueryDto,
  GetVendorPaginatedOrderItemsQueryDto,
  OrderItemResponseReadModel,
  UpdateOrderItemDto,
  VendorOrderItemResponseReadModel,
} from '@ecomerece/shared';
import { http } from './../../lib';

export type OrderItemMutationResult = {
  message: string;
  updatedData?: OrderItemResponseReadModel;
};

export type OrderItemsCancelledResult = {
  message: string;
  cancelledCount: number;
};

export type PaginatedOrderItemsResult<TItem = OrderItemResponseReadModel> = {
  data: TItem[];
  meta: {
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
  };
};

function toQuery(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) searchParams.set(key, String(value));
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

export class OrderItemsService {
  // Buyer
  getMyOrderItems(orderId: string): Promise<OrderItemResponseReadModel[]> {
    return http.get<OrderItemResponseReadModel[]>(`/order-items/my/order/${orderId}`);
  }

  cancelMyOrderItems(data: CancelMyOrderItemsDto): Promise<OrderItemsCancelledResult> {
    return http.post<OrderItemsCancelledResult>('/order-items/my/cancel', data);
  }

  // Vendor
  getVendorPaginatedOrderItems(
    params: GetVendorPaginatedOrderItemsQueryDto,
  ): Promise<PaginatedOrderItemsResult<VendorOrderItemResponseReadModel>> {
    return http.get<PaginatedOrderItemsResult<VendorOrderItemResponseReadModel>>(
      `/order-items/vendor/all${toQuery({ ...params })}`,
    );
  }

  getVendorOrderItem(id: string): Promise<VendorOrderItemResponseReadModel> {
    return http.get<VendorOrderItemResponseReadModel>(`/order-items/vendor/${id}`);
  }

  updateVendorOrderItem(id: string, data: UpdateOrderItemDto): Promise<OrderItemMutationResult> {
    return http.patch<OrderItemMutationResult>(`/order-items/vendor/${id}`, data);
  }

  confirmVendorOrderItem(id: string): Promise<OrderItemMutationResult> {
    return http.post<OrderItemMutationResult>(`/order-items/vendor/${id}/confirm`, {});
  }

  completeVendorOrderItem(id: string): Promise<OrderItemMutationResult> {
    return http.post<OrderItemMutationResult>(`/order-items/vendor/${id}/complete`, {});
  }

  returnVendorOrderItem(id: string): Promise<OrderItemMutationResult> {
    return http.post<OrderItemMutationResult>(`/order-items/vendor/${id}/return`, {});
  }

  refundVendorOrderItem(id: string): Promise<OrderItemMutationResult> {
    return http.post<OrderItemMutationResult>(`/order-items/vendor/${id}/refund`, {});
  }

  // Admin
  getAdminPaginatedOrderItems(
    params: GetAdminPaginatedOrderItemsQueryDto,
  ): Promise<PaginatedOrderItemsResult> {
    return http.get<PaginatedOrderItemsResult>(`/order-items/admin/all${toQuery({ ...params })}`);
  }

  getAdminOrderItem(id: string): Promise<OrderItemResponseReadModel> {
    return http.get<OrderItemResponseReadModel>(`/order-items/admin/${id}`);
  }

  updateAdminOrderItem(id: string, data: UpdateOrderItemDto): Promise<OrderItemMutationResult> {
    return http.patch<OrderItemMutationResult>(`/order-items/admin/${id}`, data);
  }

  deleteAdminOrderItem(id: string, data: DeleteOrderItemDto): Promise<OrderItemMutationResult> {
    return http.delete<OrderItemMutationResult>(`/order-items/admin/${id}`, data);
  }

  recoverAdminOrderItem(id: string): Promise<OrderItemMutationResult> {
    return http.post<OrderItemMutationResult>(`/order-items/admin/${id}/recover`, {});
  }

  confirmAdminOrderItem(id: string): Promise<OrderItemMutationResult> {
    return http.post<OrderItemMutationResult>(`/order-items/admin/${id}/confirm`, {});
  }

  completeAdminOrderItem(id: string): Promise<OrderItemMutationResult> {
    return http.post<OrderItemMutationResult>(`/order-items/admin/${id}/complete`, {});
  }

  returnAdminOrderItem(id: string): Promise<OrderItemMutationResult> {
    return http.post<OrderItemMutationResult>(`/order-items/admin/${id}/return`, {});
  }

  refundAdminOrderItem(id: string): Promise<OrderItemMutationResult> {
    return http.post<OrderItemMutationResult>(`/order-items/admin/${id}/refund`, {});
  }
}

export const orderItemsService = new OrderItemsService();
