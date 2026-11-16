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

const ReturnModelSchema = new Schema(
  {
    _id: { type: String, required: true },

    orderId: { type: String, required: true, index: true },
    orderItemId: { type: String, required: true, index: true },
    vendorId: { type: String, required: true, index: true },
    buyerId: { type: String, required: true, index: true },

    quantity: { type: Number, required: true, min: 1 },
    returnType: { type: String, required: true, enum: ['refund', 'replacement'] },
    reason: { type: String, required: true },
    status: {
      type: String,
      required: true,
      default: 'requested',
      index: true,
      enum: ['requested', 'approved', 'rejected', 'shipped_back', 'received', 'cancelled'],
    },
    decisionReason: { type: String, default: null },

    requestedAt: { type: Date, required: true },
    decidedAt: { type: Date, default: null },
    receivedAt: { type: Date, default: null },

    version: { type: Number, required: true, default: 0 },
    deleted: { type: deletedSchema, required: true },
  },
  { timestamps: true, versionKey: false },
);

export interface ReturnPersistence {
  _id: string;
  orderId: string;
  orderItemId: string;
  vendorId: string;
  buyerId: string;
  quantity: number;
  returnType: string;
  reason: string;
  status: string;
  decisionReason: string | null;
  requestedAt: Date;
  decidedAt: Date | null;
  receivedAt: Date | null;
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

export type ReturnDocument = HydratedDocument<ReturnPersistence>;
export const ReturnModel = mongoose.model<ReturnPersistence>('ReturnRequest', ReturnModelSchema);
