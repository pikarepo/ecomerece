// order.service.ts

import type {
  buyNowOrderDtoType,
  createMyOrderDtoType,
  GetAdminPaginatedOrdersQueryDto,
  GetMyOrdersQueryDto,
  GetVendorPaginatedOrdersQueryDto,
  orderReasonDtoType,
  OrderResponseReadModel,
  updateOrderDtoType,
  VendorOrderItemResponseReadModel,
  VendorOrderListItemReadModel,
  VendorOrderResponseReadModel,
} from '@ecomerece/shared';
import { http } from './../../lib';

export type OrderMutationResult = {
  message: string;
  updatedData?: OrderResponseReadModel;
};

export type OrderListItem = {
  id: string;
  buyerId: string;
  totalPrice: number;
  address: string;
  deleted: {
    deleted: boolean;
    deletedFrom: Date | null;
    deletedBy: string | null;
    reason: string | null;
  };
  createdAt: Date;
};

export type PaginatedOrdersResult = {
  data: OrderListItem[];
  meta: {
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
  };
};

export type PaginatedVendorOrdersResult = {
  data: VendorOrderListItemReadModel[];
  meta: {
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
  };
};

/** Vendor detail: their own lines only, with the vendor subtotal. */
export type VendorOrderDetailResult = {
  order: VendorOrderResponseReadModel;
  items: VendorOrderItemResponseReadModel[];
};

export class OrderService {
  createMyOrder(data: createMyOrderDtoType): Promise<OrderMutationResult> {
    return http.post<OrderMutationResult>('/order/my', data);
  }

  getMyOrders(params: GetMyOrdersQueryDto): Promise<PaginatedOrdersResult> {
    const searchParams = new URLSearchParams();
    if (params.cursor) searchParams.set('cursor', params.cursor);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.direction) searchParams.set('direction', params.direction);
    const qs = searchParams.toString();
    return http.get<PaginatedOrdersResult>(`/order/my${qs ? `?${qs}` : ''}`);
  }

  getAdminPaginatedOrders(params: GetAdminPaginatedOrdersQueryDto): Promise<PaginatedOrdersResult> {
    const searchParams = new URLSearchParams();
    if (params.buyerId) searchParams.set('buyerId', params.buyerId);
    if (params.deleted !== undefined) searchParams.set('deleted', String(params.deleted));
    if (params.cursor) searchParams.set('cursor', params.cursor);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.direction) searchParams.set('direction', params.direction);
    const qs = searchParams.toString();
    return http.get<PaginatedOrdersResult>(`/order/admin/all${qs ? `?${qs}` : ''}`);
  }

  buyNow(data: buyNowOrderDtoType): Promise<OrderMutationResult> {
    return http.post<OrderMutationResult>('/order/my/buy-now', data);
  }

  getMyOrderById(id: string): Promise<OrderResponseReadModel> {
    return http.get<OrderResponseReadModel>(`/order/my/${id}`);
  }

  cancelMyOrder(id: string, data: orderReasonDtoType): Promise<OrderMutationResult> {
    return http.post<OrderMutationResult>(`/order/my/${id}/cancel`, data);
  }

  retryMyOrderItems(id: string): Promise<OrderMutationResult> {
    return http.post<OrderMutationResult>(`/order/my/${id}/retry-items`, {});
  }

  retryMyOrderItem(id: string): Promise<OrderMutationResult> {
    return http.post<OrderMutationResult>(`/order/my/${id}/retry-item`, {});
  }

  getVendorPaginatedOrders(
    params: GetVendorPaginatedOrdersQueryDto,
  ): Promise<PaginatedVendorOrdersResult> {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.set('status', params.status);
    if (params.cursor) searchParams.set('cursor', params.cursor);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.direction) searchParams.set('direction', params.direction);
    const qs = searchParams.toString();
    return http.get<PaginatedVendorOrdersResult>(`/order/vendor/all${qs ? `?${qs}` : ''}`);
  }

  getVendorOrderById(id: string): Promise<VendorOrderDetailResult> {
    return http.get<VendorOrderDetailResult>(`/order/vendor/${id}`);
  }

  confirmVendorOrder(id: string): Promise<OrderMutationResult> {
    return http.post<OrderMutationResult>(`/order/vendor/${id}/confirm`, {});
  }

  completeVendorOrder(id: string): Promise<OrderMutationResult> {
    return http.post<OrderMutationResult>(`/order/vendor/${id}/complete`, {});
  }

  returnVendorOrder(id: string, data: orderReasonDtoType): Promise<OrderMutationResult> {
    return http.post<OrderMutationResult>(`/order/vendor/${id}/return`, data);
  }

  refundVendorOrder(id: string, data: orderReasonDtoType): Promise<OrderMutationResult> {
    return http.post<OrderMutationResult>(`/order/vendor/${id}/refund`, data);
  }

  getAdminOrderById(id: string): Promise<OrderResponseReadModel> {
    return http.get<OrderResponseReadModel>(`/order/admin/${id}`);
  }

  updateAdminOrder(id: string, data: updateOrderDtoType): Promise<OrderMutationResult> {
    return http.patch<OrderMutationResult>(`/order/admin/${id}`, data);
  }

  deleteAdminOrder(id: string, data: orderReasonDtoType): Promise<OrderMutationResult> {
    return http.delete<OrderMutationResult>(`/order/admin/${id}`, data);
  }

  recoverAdminOrder(id: string): Promise<OrderMutationResult> {
    return http.patch<OrderMutationResult>(`/order/admin/${id}/recover`);
  }

  cancelAdminOrder(id: string, data: orderReasonDtoType): Promise<OrderMutationResult> {
    return http.post<OrderMutationResult>(`/order/admin/${id}/cancel`, data);
  }

  confirmAdminOrder(id: string): Promise<OrderMutationResult> {
    return http.post<OrderMutationResult>(`/order/admin/${id}/confirm`, {});
  }

  completeAdminOrder(id: string): Promise<OrderMutationResult> {
    return http.post<OrderMutationResult>(`/order/admin/${id}/complete`, {});
  }

  returnAdminOrder(id: string, data: orderReasonDtoType): Promise<OrderMutationResult> {
    return http.post<OrderMutationResult>(`/order/admin/${id}/return`, data);
  }

  refundAdminOrder(id: string, data: orderReasonDtoType): Promise<OrderMutationResult> {
    return http.post<OrderMutationResult>(`/order/admin/${id}/refund`, data);
  }
}

export const orderService = new OrderService();
