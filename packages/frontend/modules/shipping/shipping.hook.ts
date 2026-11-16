// shipping.hook.ts

import {
  assignTrackingDto,
  type assignTrackingDtoType,
  createShipmentDto,
  type createShipmentDtoType,
  getAdminShipmentsQuerySchema,
  type GetAdminShipmentsQueryDto,
  getMyShipmentsQuerySchema,
  type GetMyShipmentsQueryDto,
  getVendorShipmentsQuerySchema,
  type GetVendorShipmentsQueryDto,
  shipmentReasonDto,
  type shipmentReasonDtoType,
} from '@ecomerece/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { shippingService } from './shipping.service';

export const SHIPPING_QUERY_KEY = ['shipping'];

function invalidateShipments(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: SHIPPING_QUERY_KEY });
}

type IdAndData<TData> = { id: string; data: TData };

// ── Queries ───────────────────────────────────────────────────────────────────

export function useTrackShipment(trackingNumber: string) {
  return useQuery({
    queryKey: [...SHIPPING_QUERY_KEY, 'track', trackingNumber],
    queryFn: () => shippingService.trackShipment(trackingNumber),
    enabled: trackingNumber.length >= 6,
  });
}

export function useGetMyShipments(params: GetMyShipmentsQueryDto) {
  return useQuery({
    queryKey: [...SHIPPING_QUERY_KEY, 'my', params],
    queryFn: () => shippingService.getMyShipments(getMyShipmentsQuerySchema.parse(params)),
  });
}

export function useGetMyShipmentById(id: string) {
  return useQuery({
    queryKey: [...SHIPPING_QUERY_KEY, 'my', id],
    queryFn: () => shippingService.getMyShipmentById(id),
    enabled: !!id,
  });
}

export function useGetVendorShipments(params: GetVendorShipmentsQueryDto) {
  return useQuery({
    queryKey: [...SHIPPING_QUERY_KEY, 'vendor', params],
    queryFn: () => shippingService.getVendorShipments(getVendorShipmentsQuerySchema.parse(params)),
  });
}

export function useGetVendorShipmentById(id: string) {
  return useQuery({
    queryKey: [...SHIPPING_QUERY_KEY, 'vendor', id],
    queryFn: () => shippingService.getVendorShipmentById(id),
    enabled: !!id,
  });
}

export function useGetAdminShipments(params: GetAdminShipmentsQueryDto) {
  return useQuery({
    queryKey: [...SHIPPING_QUERY_KEY, 'admin', params],
    queryFn: () => shippingService.getAdminShipments(getAdminShipmentsQuerySchema.parse(params)),
  });
}

export function useGetAdminShipmentById(id: string) {
  return useQuery({
    queryKey: [...SHIPPING_QUERY_KEY, 'admin', id],
    queryFn: () => shippingService.getAdminShipmentById(id),
    enabled: !!id,
  });
}

// ── Vendor mutations ──────────────────────────────────────────────────────────

export function useCreateVendorShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: createShipmentDtoType) =>
      shippingService.createVendorShipment(createShipmentDto.parse(data)),
    onSuccess: () => invalidateShipments(queryClient),
  });
}

export function useAssignVendorTracking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: IdAndData<assignTrackingDtoType>) =>
      shippingService.assignVendorTracking(id, assignTrackingDto.parse(data)),
    onSuccess: () => invalidateShipments(queryClient),
  });
}

export function useDispatchVendorShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shippingService.dispatchVendorShipment(id),
    onSuccess: () => invalidateShipments(queryClient),
  });
}

export function useInTransitVendorShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shippingService.inTransitVendorShipment(id),
    onSuccess: () => invalidateShipments(queryClient),
  });
}

export function useOutForDeliveryVendorShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shippingService.outForDeliveryVendorShipment(id),
    onSuccess: () => invalidateShipments(queryClient),
  });
}

export function useDeliverVendorShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shippingService.deliverVendorShipment(id),
    onSuccess: () => invalidateShipments(queryClient),
  });
}

export function useFailVendorShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: IdAndData<shipmentReasonDtoType>) =>
      shippingService.failVendorShipment(id, shipmentReasonDto.parse(data)),
    onSuccess: () => invalidateShipments(queryClient),
  });
}

export function useReturnVendorShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: IdAndData<shipmentReasonDtoType>) =>
      shippingService.returnVendorShipment(id, shipmentReasonDto.parse(data)),
    onSuccess: () => invalidateShipments(queryClient),
  });
}

export function useCancelVendorShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: IdAndData<shipmentReasonDtoType>) =>
      shippingService.cancelVendorShipment(id, shipmentReasonDto.parse(data)),
    onSuccess: () => invalidateShipments(queryClient),
  });
}

// ── Admin mutations ───────────────────────────────────────────────────────────

export function useCreateAdminShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: createShipmentDtoType) =>
      shippingService.createAdminShipment(createShipmentDto.parse(data)),
    onSuccess: () => invalidateShipments(queryClient),
  });
}

export function useAssignAdminTracking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: IdAndData<assignTrackingDtoType>) =>
      shippingService.assignAdminTracking(id, assignTrackingDto.parse(data)),
    onSuccess: () => invalidateShipments(queryClient),
  });
}

export function useDispatchAdminShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shippingService.dispatchAdminShipment(id),
    onSuccess: () => invalidateShipments(queryClient),
  });
}

export function useInTransitAdminShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shippingService.inTransitAdminShipment(id),
    onSuccess: () => invalidateShipments(queryClient),
  });
}

export function useOutForDeliveryAdminShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shippingService.outForDeliveryAdminShipment(id),
    onSuccess: () => invalidateShipments(queryClient),
  });
}

export function useDeliverAdminShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shippingService.deliverAdminShipment(id),
    onSuccess: () => invalidateShipments(queryClient),
  });
}

export function useFailAdminShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: IdAndData<shipmentReasonDtoType>) =>
      shippingService.failAdminShipment(id, shipmentReasonDto.parse(data)),
    onSuccess: () => invalidateShipments(queryClient),
  });
}

export function useReturnAdminShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: IdAndData<shipmentReasonDtoType>) =>
      shippingService.returnAdminShipment(id, shipmentReasonDto.parse(data)),
    onSuccess: () => invalidateShipments(queryClient),
  });
}

export function useCancelAdminShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: IdAndData<shipmentReasonDtoType>) =>
      shippingService.cancelAdminShipment(id, shipmentReasonDto.parse(data)),
    onSuccess: () => invalidateShipments(queryClient),
  });
}

export function useDeleteAdminShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: IdAndData<shipmentReasonDtoType>) =>
      shippingService.deleteAdminShipment(id, shipmentReasonDto.parse(data)),
    onSuccess: () => invalidateShipments(queryClient),
  });
}

export function useRecoverAdminShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shippingService.recoverAdminShipment(id),
    onSuccess: () => invalidateShipments(queryClient),
  });
}
