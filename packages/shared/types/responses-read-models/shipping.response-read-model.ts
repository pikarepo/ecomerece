export interface ShipmentTrackingEventResponseReadModel {
  status: string;
  note: string | null;
  occurredAt: Date;
}

export interface ShipmentResponseReadModel {
  id: string;
  orderId: string;
  vendorId: string;
  carrier: string;
  shippingMethod: string;
  trackingNumber: string | null;
  status: string;
  cost: number;
  weightGrams: number;
  address: string;
  estimatedDelivery: Date | null;
  dispatchedAt: Date | null;
  deliveredAt: Date | null;
  events: ShipmentTrackingEventResponseReadModel[];
  createdAt: Date;
}

export interface ShipmentListItemResponseReadModel {
  id: string;
  orderId: string;
  carrier: string;
  shippingMethod: string;
  trackingNumber: string | null;
  status: string;
  cost: number;
  estimatedDelivery: Date | null;
  createdAt: Date;
}

/**
 * Public tracking view. Buyer, vendor and the delivery address are withheld:
 * anyone with the tracking number may read it.
 */
export interface PublicShipmentTrackingReadModel {
  trackingNumber: string;
  carrier: string;
  shippingMethod: string;
  status: string;
  estimatedDelivery: Date | null;
  deliveredAt: Date | null;
  events: ShipmentTrackingEventResponseReadModel[];
}
