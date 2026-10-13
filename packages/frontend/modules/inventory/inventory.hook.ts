// inventory.hook.ts

import {
  buyMyInventoryStockDto,
  type buyMyInventoryStockDtoType,
  createMyInventoryDto,
  type createMyInventoryDtoType,
  type GetAdminPaginatedInventoryQueryDto,
  getAdminPaginatedInventoryQuerySchema,
  type InventoryResponseReadModel,
  removeMyInventoryStockDto,
  type removeMyInventoryStockDtoType,
  updateMylowStockThresholdDto,
  type updateMylowStockThresholdDtoType,
} from '@ecomerece/shared';
import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type InventoryMutationResult, inventoryService } from './inventory.service';

export const INVENTORY_QUERY_KEY = ['inventory'];

// ── Queries ─────────────────────────────────────────────────────────────────

export function useGetInventoryByVariantId(variantId: string) {
  return useQuery({
    queryKey: [...INVENTORY_QUERY_KEY, 'variant', variantId],
    queryFn: () => inventoryService.getInventoryByVariantId(variantId),
    enabled: Boolean(variantId),
  });
}

export function useGetAdminPaginatedInventory(params: GetAdminPaginatedInventoryQueryDto) {
  return useQuery({
    queryKey: [...INVENTORY_QUERY_KEY, 'admin-paginated', params],
    queryFn: () =>
      inventoryService.getAdminPaginatedInventory(
        getAdminPaginatedInventoryQuerySchema.parse(params),
      ),
  });
}

// ── Shared cache-update helper ───────────────────────────────────────────────

function applyInventoryMutationResult(queryClient: QueryClient, result: InventoryMutationResult) {
  const updated = result.updatedData;

  if (!updated) {
    queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEY });
    return;
  }

  queryClient.setQueryData([...INVENTORY_QUERY_KEY, updated.id], updated);
  queryClient.setQueryData([...INVENTORY_QUERY_KEY, 'variant', updated.variantId], updated);
}

// ── Mutations ───────────────────────────────────────────────────────────────

export function useCreateMyInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: createMyInventoryDtoType) =>
      inventoryService.createMyInventory(createMyInventoryDto.parse(data)),
    onSuccess: (data) => applyInventoryMutationResult(queryClient, data),
  });
}

export function useBuyMyInventoryStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: buyMyInventoryStockDtoType }) =>
      inventoryService.buyMyInventoryStock(id, buyMyInventoryStockDto.parse(data)),
    onSuccess: (data) => applyInventoryMutationResult(queryClient, data),
  });
}

export function useRemoveMyInventoryStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: removeMyInventoryStockDtoType }) =>
      inventoryService.removeMyInventoryStock(id, removeMyInventoryStockDto.parse(data)),
    onSuccess: (data) => applyInventoryMutationResult(queryClient, data),
  });
}

export function useUpdateMyLowStockThreshold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: updateMylowStockThresholdDtoType }) =>
      inventoryService.updateMyLowStockThreshold(id, updateMylowStockThresholdDto.parse(data)),
    onSuccess: (data) => applyInventoryMutationResult(queryClient, data),
  });
}
