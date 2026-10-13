import mongoose, { type HydratedDocument, type InferSchemaType, Schema } from 'mongoose';

const deletedSchema = new Schema(
  {
    deleted: { type: Boolean, default: false, required: true },
    deletedFrom: { type: Date, default: null },
    deletedBy: { type: String, default: null },
    reason: { type: String, default: null },
  },
  { _id: false },
);

const blockSchema = new mongoose.Schema(
  {
    blocked: { type: Boolean, default: false, required: true },
    blockedFrom: { type: Date, default: null },
    blockedBy: { type: String, default: null },
    reason: { type: String, default: null },
  },
  { _id: false },
);

export const CategorySchema = new Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    title: {
      type: String,

      required: true,
    },

    createdBy: {
      type: String,
      required: true,
    },

    version: {
      type: Number,
      default: 0,
    },
    block: {
      type: blockSchema,
      required: true,
    },
    deleted: {
      type: deletedSchema,
      required: true,
    },
    imageKey: {
      type: String,
      default: null,
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

CategorySchema.index({ title: 1 }, { collation: { locale: 'en', strength: 2 } });

export type CategoryPersistence = InferSchemaType<typeof CategorySchema>;
export type CategoryDocument = HydratedDocument<CategoryPersistence>;
export const CategoryModel = mongoose.model<CategoryPersistence>('Category', CategorySchema);
