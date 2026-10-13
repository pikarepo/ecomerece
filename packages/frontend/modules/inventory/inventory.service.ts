// inventory.service.ts

import type {
  buyMyInventoryStockDtoType,
  createMyInventoryDtoType,
  GetAdminPaginatedInventoryQueryDto,
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
  getInventoryByVariantId(variantId: string): Promise<InventoryResponseReadModel> {
    return http.get<InventoryResponseReadModel>(`/product-inventory/${variantId}`);
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

  createMyInventory(data: createMyInventoryDtoType): Promise<InventoryMutationResult> {
    return http.post<InventoryMutationResult>('/product-inventory/my/create', data);
  }

  buyMyInventoryStock(
    id: string,
    data: buyMyInventoryStockDtoType,
  ): Promise<InventoryMutationResult> {
    return http.patch<InventoryMutationResult>(`/product-inventory/my/${id}/purchase`, data);
  }

  removeMyInventoryStock(
    id: string,
    data: removeMyInventoryStockDtoType,
  ): Promise<InventoryMutationResult> {
    return http.patch<InventoryMutationResult>(`/product-inventory/my/${id}/remove`, data);
  }

  updateMyLowStockThreshold(
    id: string,
    data: updateMylowStockThresholdDtoType,
  ): Promise<InventoryMutationResult> {
    return http.patch<InventoryMutationResult>(`/product-inventory/my/${id}/threshold`, data);
  }
}

export const inventoryService = new InventoryService();
