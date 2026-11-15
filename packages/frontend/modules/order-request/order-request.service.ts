// order-request.service.ts

import type {
  AcceptOrderRequestDto,
  CreateOrderRequestDto,
  GetAdminOrderRequestsQueryDto,
  GetMyOrderRequestsQueryDto,
  GetVendorOrderRequestsQueryDto,
  OrderRequestResponseReadModel,
  RejectOrderRequestDto,
} from '@ecomerece/shared';
import { http } from './../../lib';

export type OrderRequestMutationResult = {
  message: string;
  updatedData?: OrderRequestResponseReadModel;
};

export type PaginatedOrderRequestsResult = {
  data: OrderRequestResponseReadModel[];
  meta: {
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
  };
};

function toQuery(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) searchParams.set(key, String(value));
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

export class OrderRequestService {
  // Buyer
  getMyOrderRequests(params: GetMyOrderRequestsQueryDto): Promise<PaginatedOrderRequestsResult> {
    return http.get<PaginatedOrderRequestsResult>(`/order-request/my${toQuery({ ...params })}`);
  }

  createMyOrderRequest(data: CreateOrderRequestDto): Promise<OrderRequestMutationResult> {
    return http.post<OrderRequestMutationResult>('/order-request/my', data);
  }

  getMyOrderRequest(id: string): Promise<OrderRequestResponseReadModel> {
    return http.get<OrderRequestResponseReadModel>(`/order-request/my/${id}`);
  }

  cancelMyOrderRequest(id: string): Promise<OrderRequestMutationResult> {
    return http.patch<OrderRequestMutationResult>(`/order-request/my/${id}/cancel`, {});
  }

  // Vendor
  getVendorOrderRequests(
    params: GetVendorOrderRequestsQueryDto,
  ): Promise<PaginatedOrderRequestsResult> {
    return http.get<PaginatedOrderRequestsResult>(
      `/order-request/vendor/all${toQuery({ ...params })}`,
    );
  }

  getVendorOrderRequest(id: string): Promise<OrderRequestResponseReadModel> {
    return http.get<OrderRequestResponseReadModel>(`/order-request/vendor/${id}`);
  }

  acceptVendorOrderRequest(
    id: string,
    data: AcceptOrderRequestDto,
  ): Promise<OrderRequestMutationResult> {
    return http.post<OrderRequestMutationResult>(`/order-request/vendor/${id}/accept`, data);
  }

  rejectVendorOrderRequest(
    id: string,
    data: RejectOrderRequestDto,
  ): Promise<OrderRequestMutationResult> {
    return http.post<OrderRequestMutationResult>(`/order-request/vendor/${id}/reject`, data);
  }

  // Admin
  getAdminOrderRequests(
    params: GetAdminOrderRequestsQueryDto,
  ): Promise<PaginatedOrderRequestsResult> {
    return http.get<PaginatedOrderRequestsResult>(
      `/order-request/admin/all${toQuery({ ...params })}`,
    );
  }

  getAdminOrderRequest(id: string): Promise<OrderRequestResponseReadModel> {
    return http.get<OrderRequestResponseReadModel>(`/order-request/admin/${id}`);
  }

  acceptAdminOrderRequest(
    id: string,
    data: AcceptOrderRequestDto,
  ): Promise<OrderRequestMutationResult> {
    return http.post<OrderRequestMutationResult>(`/order-request/admin/${id}/accept`, data);
  }

  rejectAdminOrderRequest(
    id: string,
    data: RejectOrderRequestDto,
  ): Promise<OrderRequestMutationResult> {
    return http.post<OrderRequestMutationResult>(`/order-request/admin/${id}/reject`, data);
  }

  cancelAdminOrderRequest(id: string): Promise<OrderRequestMutationResult> {
    return http.post<OrderRequestMutationResult>(`/order-request/admin/${id}/cancel`, {});
  }
}

export const orderRequestService = new OrderRequestService();
