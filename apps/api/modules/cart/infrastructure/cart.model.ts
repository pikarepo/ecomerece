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

const cartItemSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    variantId: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    addedAt: { type: Date, required: true },
  },
  { _id: false },
);

const CartModelSchema = new Schema(
  {
    _id: { type: String, required: true },
    buyerId: { type: String, required: true, unique: true },
    items: { type: [cartItemSchema], default: [] },
    version: { type: Number, required: true, default: 0 },
    deleted: { type: deletedSchema, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export interface CartItemPersistence {
  _id: string;
  variantId: string;
  quantity: number;
  addedAt: Date;
}

export interface CartPersistence {
  _id: string;
  buyerId: string;
  items: CartItemPersistence[];
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

export type CartDocument = HydratedDocument<CartPersistence>;
export const CartModel = mongoose.model<CartPersistence>('Cart', CartModelSchema);
