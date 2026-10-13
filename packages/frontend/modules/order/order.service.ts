// order.service.ts

import type {
  createMyOrderDtoType,
  GetAdminPaginatedOrdersQueryDto,
  GetMyOrdersQueryDto,
  OrderResponseReadModel,
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

export class OrderService {
  createMyOrder(data: createMyOrderDtoType): Promise<OrderMutationResult> {
    return http.post<OrderMutationResult>('/order/create/my', data);
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
}

export const orderService = new OrderService();
