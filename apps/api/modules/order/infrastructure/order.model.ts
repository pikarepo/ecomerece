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

const OrderModelSchema = new Schema(
  {
    _id: { type: String, required: true },

    idempotentKey: { type: String, required: true, unique: true },

    version: {
      type: Number,
      required: true,
      default: 0,
    },
    buyerId: {
      type: String,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },
    deleted: {
      type: deletedSchema,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
export interface OrderPersistence {
  _id: string;
  idempotentKey: string;
  version: number;
  buyerId: string;
  totalPrice: number;
  address: string;
  deleted: {
    deleted: boolean;
    deletedFrom?: Date | null;
    deletedBy?: string | null;
    reason?: string | null;
  };

  createdAt: Date;
  updatedAt: Date;
}

export type OrderDocument = HydratedDocument<OrderPersistence>;
export const OrderModel = mongoose.model<OrderPersistence>('Order', OrderModelSchema);
