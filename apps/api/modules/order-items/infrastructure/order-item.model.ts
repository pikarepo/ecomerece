import {
  OrderItemFailureReasonEnum,
  StatusEnum,
  type OrderItemFailureReason,
  type StatusType,
} from '@ecomerece/domain';
import mongoose, { type HydratedDocument } from 'mongoose';

const deletedSchema = new mongoose.Schema(
  {
    deleted: { type: Boolean, default: false, required: true },
    deletedFrom: { type: Date, default: null },
    deletedBy: { type: String, default: null },
    reason: { type: String, default: null },
  },
  { _id: false },
);

export interface OrderItemsPersistence {
  _id: string;
  quantity: number;
  waitingTime: Date;
  status: StatusType;
  totalPrice: number;
  /** Null only for rejected lines: no price was ever agreed. */
  price: number | null;
  orderId: string;
  /** Null only for rejected lines, which were never resolved to a vendor. */
  vendorId: string | null;
  /** Null only for rejected lines, which were never resolved to a product. */
  productId: string | null;
  variantId: string;
  /** Set only when the line was rejected instead of bought. */
  failureReason: OrderItemFailureReason | null;
  version: number;
  deleted: {
    deleted: boolean;
    deletedFrom: Date | null;
    deletedBy: string | null;
    reason: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemsModelSchema = new mongoose.Schema<OrderItemsPersistence>(
  {
    _id: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    waitingTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(StatusEnum),
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      default: null,
    },
    orderId: {
      type: String,
      required: true,
    },
    vendorId: {
      type: String,
      default: null,
    },
    productId: {
      type: String,
      default: null,
    },
    variantId: {
      type: String,
      required: true,
    },
    failureReason: {
      type: String,
      enum: [...Object.values(OrderItemFailureReasonEnum), null],
      default: null,
    },
    version: {
      type: Number,
      required: true,
      default: 0,
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

export type OrderItemsDocument = HydratedDocument<OrderItemsPersistence>;

export const OrderItemsModel = mongoose.model<OrderItemsPersistence>(
  'Order-Items',
  OrderItemsModelSchema,
);
