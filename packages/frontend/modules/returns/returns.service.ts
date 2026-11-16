// returns.service.ts

import type {
  createReturnDtoType,
  GetAdminReturnsQueryDto,
  GetMyReturnsQueryDto,
  GetVendorReturnsQueryDto,
  ReturnListItemResponseReadModel,
  ReturnResponseReadModel,
  returnDecisionDtoType,
} from '@ecomerece/shared';
import { http } from './../../lib';

export type ReturnMutationResult = {
  message: string;
  updatedData?: ReturnResponseReadModel;
};

export type PaginatedReturnsResult = {
  data: ReturnListItemResponseReadModel[];
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

export class ReturnsService {
  // ── Buyer ─────────────────────────────────────────────────────────────────

  createMyReturn(data: createReturnDtoType): Promise<ReturnMutationResult> {
    return http.post<ReturnMutationResult>('/return/my', data);
  }

  getMyReturns(params: GetMyReturnsQueryDto): Promise<PaginatedReturnsResult> {
    return http.get<PaginatedReturnsResult>(
      `/return/my/all${buildQuery({
        orderId: params.orderId,
        status: params.status,
        cursor: params.cursor,
        limit: params.limit,
        direction: params.direction,
      })}`,
    );
  }

  getMyReturnById(id: string): Promise<ReturnResponseReadModel> {
    return http.get<ReturnResponseReadModel>(`/return/my/${id}`);
  }

  cancelMyReturn(id: string, data: returnDecisionDtoType): Promise<ReturnMutationResult> {
    return http.post<ReturnMutationResult>(`/return/my/${id}/cancel`, data);
  }

  // ── Vendor ────────────────────────────────────────────────────────────────

  getVendorReturns(params: GetVendorReturnsQueryDto): Promise<PaginatedReturnsResult> {
    return http.get<PaginatedReturnsResult>(
      `/return/vendor/all${buildQuery({
        orderId: params.orderId,
        status: params.status,
        cursor: params.cursor,
        limit: params.limit,
        direction: params.direction,
      })}`,
    );
  }

  getVendorReturnById(id: string): Promise<ReturnResponseReadModel> {
    return http.get<ReturnResponseReadModel>(`/return/vendor/${id}`);
  }

  approveVendorReturn(id: string): Promise<ReturnMutationResult> {
    return http.post<ReturnMutationResult>(`/return/vendor/${id}/approve`, {});
  }

  rejectVendorReturn(id: string, data: returnDecisionDtoType): Promise<ReturnMutationResult> {
    return http.post<ReturnMutationResult>(`/return/vendor/${id}/reject`, data);
  }

  shippedBackVendorReturn(id: string): Promise<ReturnMutationResult> {
    return http.post<ReturnMutationResult>(`/return/vendor/${id}/shipped-back`, {});
  }

  receivedVendorReturn(id: string): Promise<ReturnMutationResult> {
    return http.post<ReturnMutationResult>(`/return/vendor/${id}/received`, {});
  }

  // ── Admin ─────────────────────────────────────────────────────────────────

  getAdminReturns(params: GetAdminReturnsQueryDto): Promise<PaginatedReturnsResult> {
    return http.get<PaginatedReturnsResult>(
      `/return/admin/all${buildQuery({
        orderId: params.orderId,
        orderItemId: params.orderItemId,
        vendorId: params.vendorId,
        buyerId: params.buyerId,
        status: params.status,
        deleted: params.deleted,
        cursor: params.cursor,
        limit: params.limit,
        direction: params.direction,
      })}`,
    );
  }

  getAdminReturnById(id: string): Promise<ReturnResponseReadModel> {
    return http.get<ReturnResponseReadModel>(`/return/admin/${id}`);
  }

  approveAdminReturn(id: string): Promise<ReturnMutationResult> {
    return http.post<ReturnMutationResult>(`/return/admin/${id}/approve`, {});
  }

  rejectAdminReturn(id: string, data: returnDecisionDtoType): Promise<ReturnMutationResult> {
    return http.post<ReturnMutationResult>(`/return/admin/${id}/reject`, data);
  }

  shippedBackAdminReturn(id: string): Promise<ReturnMutationResult> {
    return http.post<ReturnMutationResult>(`/return/admin/${id}/shipped-back`, {});
  }

  receivedAdminReturn(id: string): Promise<ReturnMutationResult> {
    return http.post<ReturnMutationResult>(`/return/admin/${id}/received`, {});
  }

  cancelAdminReturn(id: string, data: returnDecisionDtoType): Promise<ReturnMutationResult> {
    return http.post<ReturnMutationResult>(`/return/admin/${id}/cancel`, data);
  }

  deleteAdminReturn(id: string, data: returnDecisionDtoType): Promise<ReturnMutationResult> {
    return http.delete<ReturnMutationResult>(`/return/admin/${id}`, data);
  }

  recoverAdminReturn(id: string): Promise<ReturnMutationResult> {
    return http.patch<ReturnMutationResult>(`/return/admin/${id}/recover`);
  }
}

export const returnsService = new ReturnsService();
