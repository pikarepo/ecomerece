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
    // One entry per vendor: a single order buys from one vendor, a cart order
    // may buy from several, but it is still one order row.
    vendorIds: {
      type: [String],
      required: true,
      index: true,
    },
    orderType: {
      type: String,
      required: true,
      default: 'single',
      enum: ['single', 'cart'],
    },
    totalPrice: {
      type: Number,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: 'pending',
      enum: ['pending', 'confirmed', 'completed', 'returned', 'refunded', 'cancelled'],
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
  vendorIds: string[];
  orderType: string;
  totalPrice: number;
  address: string;
  status: string;
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
