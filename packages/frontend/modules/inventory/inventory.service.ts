// inventory.service.ts

import type {
  buyMyInventoryStockDtoType,
  createMyInventoryDtoType,
  DeleteInventoryDto,
  GetAdminPaginatedInventoryQueryDto,
  GetVendorPaginatedInventoryQueryDto,
  InventoryPublicResponseReadModel,
  InventoryResponseReadModel,
  removeMyInventoryStockDtoType,
  updateMylowStockThresholdDtoType,
} from '@ecomerece/shared';
import { http } from './../../lib';

export type InventoryMutationResult = {
  message: string;
  updatedData?: InventoryResponseReadModel;
};

export type PaginatedInventoryResult = {
  data: InventoryResponseReadModel[];
  meta: {
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
  };
};

export class InventoryService {
  getInventoryByVariantId(variantId: string): Promise<InventoryPublicResponseReadModel> {
    return http.get<InventoryPublicResponseReadModel>(`/product-inventory/variant/${variantId}`);
  }

  getAdminPaginatedInventory(
    params: GetAdminPaginatedInventoryQueryDto,
  ): Promise<PaginatedInventoryResult> {
    const searchParams = new URLSearchParams();
    if (params.variantId) searchParams.set('variantId', params.variantId);
    if (params.inStock !== undefined) searchParams.set('inStock', String(params.inStock));
    if (params.deleted !== undefined) searchParams.set('deleted', String(params.deleted));
    if (params.cursor) searchParams.set('cursor', params.cursor);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.direction) searchParams.set('direction', params.direction);
    const qs = searchParams.toString();
    return http.get<PaginatedInventoryResult>(`/product-inventory/admin/all${qs ? `?${qs}` : ''}`);
  }

  getVendorPaginatedInventory(
    params: GetVendorPaginatedInventoryQueryDto,
  ): Promise<PaginatedInventoryResult> {
    const searchParams = new URLSearchParams();
    if (params.inStock !== undefined) searchParams.set('inStock', String(params.inStock));
    if (params.cursor) searchParams.set('cursor', params.cursor);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.direction) searchParams.set('direction', params.direction);
    const qs = searchParams.toString();
    return http.get<PaginatedInventoryResult>(`/product-inventory/vendor/all${qs ? `?${qs}` : ''}`);
  }

  getVendorInventory(id: string): Promise<InventoryResponseReadModel> {
    return http.get<InventoryResponseReadModel>(`/product-inventory/vendor/${id}`);
  }

  deleteMyInventory(id: string, data: DeleteInventoryDto): Promise<InventoryMutationResult> {
    return http.delete<InventoryMutationResult>(`/product-inventory/vendor/${id}`, data);
  }

  createMyInventory(data: createMyInventoryDtoType): Promise<InventoryMutationResult> {
    return http.post<InventoryMutationResult>('/product-inventory/vendor', data);
  }

  buyMyInventoryStock(
    id: string,
    data: buyMyInventoryStockDtoType,
  ): Promise<InventoryMutationResult> {
    return http.patch<InventoryMutationResult>(`/product-inventory/vendor/${id}/purchase`, data);
  }

  removeMyInventoryStock(
    id: string,
    data: removeMyInventoryStockDtoType,
  ): Promise<InventoryMutationResult> {
    return http.patch<InventoryMutationResult>(`/product-inventory/vendor/${id}/remove`, data);
  }

  updateMyLowStockThreshold(
    id: string,
    data: updateMylowStockThresholdDtoType,
  ): Promise<InventoryMutationResult> {
    return http.patch<InventoryMutationResult>(`/product-inventory/vendor/${id}/threshold`, data);
  }

  // Admin
  getAdminInventory(id: string): Promise<InventoryResponseReadModel> {
    return http.get<InventoryResponseReadModel>(`/product-inventory/admin/${id}`);
  }

  createAdminInventory(data: createMyInventoryDtoType): Promise<InventoryMutationResult> {
    return http.post<InventoryMutationResult>('/product-inventory/admin', data);
  }

  deleteAdminInventory(id: string, data: DeleteInventoryDto): Promise<InventoryMutationResult> {
    return http.delete<InventoryMutationResult>(`/product-inventory/admin/${id}`, data);
  }

  restockAdminInventory(
    id: string,
    data: buyMyInventoryStockDtoType,
  ): Promise<InventoryMutationResult> {
    return http.patch<InventoryMutationResult>(`/product-inventory/admin/${id}/restock`, data);
  }

  updateAdminLowStockThreshold(
    id: string,
    data: updateMylowStockThresholdDtoType,
  ): Promise<InventoryMutationResult> {
    return http.patch<InventoryMutationResult>(`/product-inventory/admin/${id}/threshold`, data);
  }

  removeAdminInventoryStock(
    id: string,
    data: removeMyInventoryStockDtoType,
  ): Promise<InventoryMutationResult> {
    return http.patch<InventoryMutationResult>(`/product-inventory/admin/${id}/remove`, data);
  }
}

export const inventoryService = new InventoryService();
