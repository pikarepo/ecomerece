import mongoose, { type HydratedDocument, type InferSchemaType, model, Schema } from 'mongoose';

const deletedSchema = new Schema(
  {
    deleted: { type: Boolean, default: false, required: true },
    deletedFrom: { type: Date, default: null },
    deletedBy: { type: String, default: null },
    reason: { type: String, default: null },
  },
  { _id: false },
);

const reviewSchema = new Schema(
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

    authorId: {
      type: String,
      ref: 'User',
      required: true,
      index: true,
    },

    orderId: {
      type: String,
      ref: 'Order',
      default: null,
    },

    authorName: {
      type: String,
      required: true,
      trim: true,
    },

    authorAvatar: {
      type: String,
      required: true,
    },

    reportCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    reportReasons: {
      type: [String],
      default: [],
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    dislikes: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    likes: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
    },

    images: {
      type: [String],
      default: [],
    },

    isVerifiedPurchase: {
      type: Boolean,
      required: true,
      default: false,
    },

    vendorReply: {
      type: String,
      default: null,
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
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: true,
    },

    versionKey: false,
  },
);

export type ReviewPersistence = InferSchemaType<typeof reviewSchema>;
export type ReviewDocument = HydratedDocument<ReviewPersistence>;
export const ReviewModel = mongoose.model<ReviewPersistence>('Review', reviewSchema);
