import type { Id, ShipmentReadModel } from '@ecomerece/domain';

/** Result of checking a shipment exists and may be used. */
export interface EnsureActiveShipmentResult {
  shipment: ShipmentReadModel | null;
  active: boolean;
}

/**
 * Cross-module read port implemented by the shipping module.
 *
 * Other modules (payments, notifications, support) ask shipping about parcels
 * through this interface; shipping itself reads orders through `IOrderQueries`,
 * so the dependency never points both ways at module internals.
 */
export interface IShipmentQueries {
  ensureActiveById(shipmentId: Id): Promise<EnsureActiveShipmentResult>;
  findByOrderId(orderId: Id): Promise<ShipmentReadModel[]>;
  findByTrackingNumber(trackingNumber: string): Promise<ShipmentReadModel | null>;
}

/** Compact parcel summary for cross-module consumers. */
export interface ShipmentSummary {
  id: string;
  orderId: string;
  status: string;
  carrier: string;
  trackingNumber: string | null;
  estimatedDelivery: Date | null;
}
