import mongoose, { type HydratedDocument, Schema } from 'mongoose';

const deletedSchema = new mongoose.Schema(
  {
    deleted: { type: Boolean, default: false, required: true },
    deletedFrom: { type: Date, default: null },
    deletedBy: { type: String, default: null },
    reason: { type: String, default: null },
  },
  { _id: false },
);

const trackingEventSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String, default: null },
    occurredAt: { type: Date, required: true },
  },
  { _id: false },
);

const ShipmentModelSchema = new Schema(
  {
    _id: { type: String, required: true },

    orderId: { type: String, required: true, index: true },
    vendorId: { type: String, required: true, index: true },
    buyerId: { type: String, required: true, index: true },

    carrier: {
      type: String,
      required: true,
      enum: ['dhl', 'fedex', 'ups', 'tcs', 'leopards', 'local'],
    },
    shippingMethod: {
      type: String,
      required: true,
      default: 'standard',
      enum: ['standard', 'express', 'overnight', 'same_day'],
    },
    // Sparse + unique: many shipments start without a label, labels never repeat.
    trackingNumber: {
      type: String,
      default: null,
      index: { unique: true, sparse: true },
    },
    status: {
      type: String,
      required: true,
      default: 'pending',
      index: true,
      enum: [
        'pending',
        'dispatched',
        'in_transit',
        'out_for_delivery',
        'delivered',
        'failed',
        'returned',
        'cancelled',
      ],
    },

    cost: { type: Number, required: true, min: 0 },
    weightGrams: { type: Number, required: true, min: 1 },
    address: { type: String, required: true },

    estimatedDelivery: { type: Date, default: null },
    dispatchedAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    events: { type: [trackingEventSchema], default: [] },

    version: { type: Number, required: true, default: 0 },
    deleted: { type: deletedSchema, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export interface ShipmentTrackingEventPersistence {
  status: string;
  note: string | null;
  occurredAt: Date;
}

export interface ShipmentPersistence {
  _id: string;
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
  events: ShipmentTrackingEventPersistence[];
  version: number;
  deleted: {
    deleted: boolean;
    deletedFrom?: Date | null;
    deletedBy?: string | null;
    reason?: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
}

export type ShipmentDocument = HydratedDocument<ShipmentPersistence>;
export const ShipmentModel = mongoose.model<ShipmentPersistence>('Shipment', ShipmentModelSchema);
