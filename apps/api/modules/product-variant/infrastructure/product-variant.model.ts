import mongoose, { type HydratedDocument, type InferSchemaType, model, Schema } from 'mongoose';

const deletedSchema = new mongoose.Schema(
  {
    deleted: { type: Boolean, default: false, required: true },
    deletedFrom: { type: Date, default: null },
    deletedBy: { type: String, default: null },
    reason: { type: String, default: null },
  },
  { _id: false },
);

const productVariantSchema = new Schema(
  {
    _id: {
      type: String,
      required: true,
    },

    productId: {
      type: String,
      ref: 'Product',
      required: true,
      index: true,
    },

    discountedPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    deleted: {
      type: deletedSchema,
      required: true,
    },

    version: {
      type: Number,
      required: true,
      default: 0,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: true,
    },

    versionKey: false,
  },
);

export type ProductVariantPersistence = InferSchemaType<typeof productVariantSchema>;
export type ProductVariantDocument = HydratedDocument<ProductVariantPersistence>;
export const ProductVariantModel = mongoose.model<ProductVariantPersistence>(
  'ProductVariant',
  productVariantSchema,
);
