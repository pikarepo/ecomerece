import { StatusEnum, type StatusType } from '@ecomerece/domain';
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
  price: number;
  orderId: string;
  vendorId: string;
  productId: string;
  variantId: string;
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
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    vendorId: {
      type: String,
      required: true,
    },
    productId: {
      type: String,
      required: true,
    },
    variantId: {
      type: String,
      required: true,
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
