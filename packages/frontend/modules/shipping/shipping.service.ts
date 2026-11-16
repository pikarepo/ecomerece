// shipping.service.ts

import type {
  assignTrackingDtoType,
  createShipmentDtoType,
  GetAdminShipmentsQueryDto,
  GetMyShipmentsQueryDto,
  GetVendorShipmentsQueryDto,
  PublicShipmentTrackingReadModel,
  ShipmentListItemResponseReadModel,
  ShipmentResponseReadModel,
  shipmentReasonDtoType,
} from '@ecomerece/shared';
import { http } from './../../lib';

export type ShipmentMutationResult = {
  message: string;
  updatedData?: ShipmentResponseReadModel;
};

export type PaginatedShipmentsResult = {
  data: ShipmentListItemResponseReadModel[];
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

export class ShippingService {
  // ── Public ────────────────────────────────────────────────────────────────

  /** Anyone holding the tracking number can read this view. */
  trackShipment(trackingNumber: string): Promise<PublicShipmentTrackingReadModel> {
    return http.get<PublicShipmentTrackingReadModel>(`/shipping/track/${trackingNumber}`);
  }

  // ── Buyer ─────────────────────────────────────────────────────────────────

  getMyShipments(params: GetMyShipmentsQueryDto): Promise<PaginatedShipmentsResult> {
    return http.get<PaginatedShipmentsResult>(
      `/shipping/my/all${buildQuery({
        orderId: params.orderId,
        status: params.status,
        cursor: params.cursor,
        limit: params.limit,
        direction: params.direction,
      })}`,
    );
  }

  getMyShipmentById(id: string): Promise<ShipmentResponseReadModel> {
    return http.get<ShipmentResponseReadModel>(`/shipping/my/${id}`);
  }

  // ── Vendor ────────────────────────────────────────────────────────────────

  getVendorShipments(params: GetVendorShipmentsQueryDto): Promise<PaginatedShipmentsResult> {
    return http.get<PaginatedShipmentsResult>(
      `/shipping/vendor/all${buildQuery({
        orderId: params.orderId,
        status: params.status,
        cursor: params.cursor,
        limit: params.limit,
        direction: params.direction,
      })}`,
    );
  }

  getVendorShipmentById(id: string): Promise<ShipmentResponseReadModel> {
    return http.get<ShipmentResponseReadModel>(`/shipping/vendor/${id}`);
  }

  createVendorShipment(data: createShipmentDtoType): Promise<ShipmentMutationResult> {
    return http.post<ShipmentMutationResult>('/shipping/vendor', data);
  }

  assignVendorTracking(id: string, data: assignTrackingDtoType): Promise<ShipmentMutationResult> {
    return http.patch<ShipmentMutationResult>(`/shipping/vendor/${id}`, data);
  }

  dispatchVendorShipment(id: string): Promise<ShipmentMutationResult> {
    return http.post<ShipmentMutationResult>(`/shipping/vendor/${id}/dispatch`, {});
  }

  inTransitVendorShipment(id: string): Promise<ShipmentMutationResult> {
    return http.post<ShipmentMutationResult>(`/shipping/vendor/${id}/in-transit`, {});
  }

  outForDeliveryVendorShipment(id: string): Promise<ShipmentMutationResult> {
    return http.post<ShipmentMutationResult>(`/shipping/vendor/${id}/out-for-delivery`, {});
  }

  deliverVendorShipment(id: string): Promise<ShipmentMutationResult> {
    return http.post<ShipmentMutationResult>(`/shipping/vendor/${id}/deliver`, {});
  }

  failVendorShipment(id: string, data: shipmentReasonDtoType): Promise<ShipmentMutationResult> {
    return http.post<ShipmentMutationResult>(`/shipping/vendor/${id}/fail`, data);
  }

  returnVendorShipment(id: string, data: shipmentReasonDtoType): Promise<ShipmentMutationResult> {
    return http.post<ShipmentMutationResult>(`/shipping/vendor/${id}/return`, data);
  }

  cancelVendorShipment(id: string, data: shipmentReasonDtoType): Promise<ShipmentMutationResult> {
    return http.post<ShipmentMutationResult>(`/shipping/vendor/${id}/cancel`, data);
  }

  // ── Admin ─────────────────────────────────────────────────────────────────

  getAdminShipments(params: GetAdminShipmentsQueryDto): Promise<PaginatedShipmentsResult> {
    return http.get<PaginatedShipmentsResult>(
      `/shipping/admin/all${buildQuery({
        orderId: params.orderId,
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

  getAdminShipmentById(id: string): Promise<ShipmentResponseReadModel> {
    return http.get<ShipmentResponseReadModel>(`/shipping/admin/${id}`);
  }

  createAdminShipment(data: createShipmentDtoType): Promise<ShipmentMutationResult> {
    return http.post<ShipmentMutationResult>('/shipping/admin', data);
  }

  assignAdminTracking(id: string, data: assignTrackingDtoType): Promise<ShipmentMutationResult> {
    return http.patch<ShipmentMutationResult>(`/shipping/admin/${id}`, data);
  }

  dispatchAdminShipment(id: string): Promise<ShipmentMutationResult> {
    return http.post<ShipmentMutationResult>(`/shipping/admin/${id}/dispatch`, {});
  }

  inTransitAdminShipment(id: string): Promise<ShipmentMutationResult> {
    return http.post<ShipmentMutationResult>(`/shipping/admin/${id}/in-transit`, {});
  }

  outForDeliveryAdminShipment(id: string): Promise<ShipmentMutationResult> {
    return http.post<ShipmentMutationResult>(`/shipping/admin/${id}/out-for-delivery`, {});
  }

  deliverAdminShipment(id: string): Promise<ShipmentMutationResult> {
    return http.post<ShipmentMutationResult>(`/shipping/admin/${id}/deliver`, {});
  }

  failAdminShipment(id: string, data: shipmentReasonDtoType): Promise<ShipmentMutationResult> {
    return http.post<ShipmentMutationResult>(`/shipping/admin/${id}/fail`, data);
  }

  returnAdminShipment(id: string, data: shipmentReasonDtoType): Promise<ShipmentMutationResult> {
    return http.post<ShipmentMutationResult>(`/shipping/admin/${id}/return`, data);
  }

  cancelAdminShipment(id: string, data: shipmentReasonDtoType): Promise<ShipmentMutationResult> {
    return http.post<ShipmentMutationResult>(`/shipping/admin/${id}/cancel`, data);
  }

  deleteAdminShipment(id: string, data: shipmentReasonDtoType): Promise<ShipmentMutationResult> {
    return http.delete<ShipmentMutationResult>(`/shipping/admin/${id}`, data);
  }

  recoverAdminShipment(id: string): Promise<ShipmentMutationResult> {
    return http.patch<ShipmentMutationResult>(`/shipping/admin/${id}/recover`);
  }
}

export const shippingService = new ShippingService();
