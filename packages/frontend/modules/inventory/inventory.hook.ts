// inventory.hook.ts

import {
  buyMyInventoryStockDto,
  type buyMyInventoryStockDtoType,
  createMyInventoryDto,
  type createMyInventoryDtoType,
  deleteInventoryDto,
  type DeleteInventoryDto,
  type GetAdminPaginatedInventoryQueryDto,
  type GetVendorPaginatedInventoryQueryDto,
  getAdminPaginatedInventoryQuerySchema,
  getVendorPaginatedInventoryQuerySchema,
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

// ── Vendor ──────────────────────────────────────────────────────────────────

export function useGetVendorPaginatedInventory(params: GetVendorPaginatedInventoryQueryDto) {
  return useQuery({
    queryKey: [...INVENTORY_QUERY_KEY, 'vendor', params],
    queryFn: () =>
      inventoryService.getVendorPaginatedInventory(
        getVendorPaginatedInventoryQuerySchema.parse(params),
      ),
  });
}

export function useGetVendorInventory(id: string) {
  return useQuery({
    queryKey: [...INVENTORY_QUERY_KEY, 'vendor', 'one', id],
    queryFn: () => inventoryService.getVendorInventory(id),
    enabled: Boolean(id),
  });
}

export function useDeleteMyInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DeleteInventoryDto }) =>
      inventoryService.deleteMyInventory(id, deleteInventoryDto.parse(data)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEY }),
  });
}

// ── Admin ───────────────────────────────────────────────────────────────────

export function useGetAdminInventory(id: string) {
  return useQuery({
    queryKey: [...INVENTORY_QUERY_KEY, 'admin', 'one', id],
    queryFn: () => inventoryService.getAdminInventory(id),
    enabled: Boolean(id),
  });
}

export function useCreateAdminInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: createMyInventoryDtoType) =>
      inventoryService.createAdminInventory(createMyInventoryDto.parse(data)),
    onSuccess: (data) => applyInventoryMutationResult(queryClient, data),
  });
}

export function useDeleteAdminInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DeleteInventoryDto }) =>
      inventoryService.deleteAdminInventory(id, deleteInventoryDto.parse(data)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEY }),
  });
}

export function useRestockAdminInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: buyMyInventoryStockDtoType }) =>
      inventoryService.restockAdminInventory(id, buyMyInventoryStockDto.parse(data)),
    onSuccess: (data) => applyInventoryMutationResult(queryClient, data),
  });
}

export function useUpdateAdminLowStockThreshold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: updateMylowStockThresholdDtoType }) =>
      inventoryService.updateAdminLowStockThreshold(id, updateMylowStockThresholdDto.parse(data)),
    onSuccess: (data) => applyInventoryMutationResult(queryClient, data),
  });
}

export function useRemoveAdminInventoryStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: removeMyInventoryStockDtoType }) =>
      inventoryService.removeAdminInventoryStock(id, removeMyInventoryStockDto.parse(data)),
    onSuccess: (data) => applyInventoryMutationResult(queryClient, data),
  });
}
