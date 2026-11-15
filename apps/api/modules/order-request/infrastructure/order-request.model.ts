import mongoose, { type HydratedDocument, Schema } from 'mongoose';

const evidenceImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    key: { type: String, default: null },
  },
  { _id: false },
);

const OrderRequestModelSchema = new Schema(
  {
    _id: { type: String, required: true },
    orderId: { type: String, required: true, index: true },
    orderItemId: { type: String, default: null, index: true },
    vendorId: { type: String, required: true, index: true },
    buyerId: { type: String, required: true, index: true },
    type: { type: String, required: true, enum: ['return', 'refund'] },
    status: {
      type: String,
      required: true,
      default: 'pending',
      enum: ['pending', 'accepted', 'rejected', 'cancelled'],
      index: true,
    },
    reason: { type: String, required: true },
    note: { type: String, default: null },
    images: { type: [evidenceImageSchema], default: [] },
    vendorResponseNote: { type: String, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export interface OrderRequestPersistence {
  _id: string;
  orderId: string;
  orderItemId: string | null;
  vendorId: string;
  buyerId: string;
  type: string;
  status: string;
  reason: string;
  note: string | null;
  images: { url: string; key: string | null }[];
  vendorResponseNote: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderRequestDocument = HydratedDocument<OrderRequestPersistence>;
export const OrderRequestModel = mongoose.model<OrderRequestPersistence>(
  'OrderRequest',
  OrderRequestModelSchema,
);
