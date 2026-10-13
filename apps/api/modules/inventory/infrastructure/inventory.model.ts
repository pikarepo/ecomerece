import mongoose, { type HydratedDocument, type InferSchemaType, Schema } from 'mongoose';

const deletedSchema = new mongoose.Schema(
  {
    deleted: { type: Boolean, default: false, required: true },
    deletedFrom: { type: Date, default: null },
    deletedBy: { type: String, default: null },
    reason: { type: String, default: null },
  },
  { _id: false },
);

const InventoryModelSchema = new Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    variantId: {
      type: String,
      unique: true,
      required: true,
    },

    version: {
      type: Number,
      required: true,
      default: 0,
    },
    available: {
      type: Number,
      default: 0,
      min: 0,
    },

    reserved: {
      type: Number,
      default: 0,
      min: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 0,
      min: 0,
    },
    deleted: {
      type: deletedSchema,
      required: true,
    },
    inStock: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export type InventoryPersistence = InferSchemaType<typeof InventoryModelSchema>;

export type InventoryDocument = HydratedDocument<InventoryPersistence>;

export const InventoryModel = mongoose.model<InventoryPersistence>(
  'Inventories',
  InventoryModelSchema,
);
