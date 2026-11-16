export interface ShipmentTrackingEventReadModel {
  status: string;
  note: string | null;
  occurredAt: Date;
}

export interface ShipmentDeleteInfoReadModel {
  deleted: boolean;
  deletedFrom: Date | null;
  deletedBy: string | null;
  reason: string | null;
}

export interface ShipmentReadModel {
  id: string;
  orderId: string;
  vendorId: string;
  buyerId: string;
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
  events: ShipmentTrackingEventReadModel[];
  deleted: ShipmentDeleteInfoReadModel;
  createdAt: Date;
}

/** Row shape for the vendor and admin parcel tables. */
export interface ShipmentListItemReadModel {
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
