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

const CouponModelSchema = new Schema(
  {
    _id: { type: String, required: true },

    code: { type: String, required: true, unique: true },
    discountType: { type: String, required: true, enum: ['percentage', 'fixed'] },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, required: true, default: 0, min: 0 },
    maxDiscountAmount: { type: Number, default: null },
    maxRedemptions: { type: Number, default: null },
    perBuyerLimit: { type: Number, required: true, default: 1, min: 1 },
    redemptionCount: { type: Number, required: true, default: 0, min: 0 },

    startsAt: { type: Date, required: true },
    expiresAt: { type: Date, default: null },
    active: { type: Boolean, required: true, default: true, index: true },

    version: { type: Number, required: true, default: 0 },
    deleted: { type: deletedSchema, required: true },
  },
  { timestamps: true, versionKey: false },
);

/**
 * One row per (coupon, order). The unique index is the idempotency guard for
 * checkout retries, and counting by buyer is what enforces `perBuyerLimit`.
 */
const CouponRedemptionSchema = new Schema(
  {
    _id: { type: String, required: true },
    couponId: { type: String, required: true, index: true },
    orderId: { type: String, required: true },
    buyerId: { type: String, required: true, index: true },
    discountAmount: { type: Number, required: true, min: 0 },
    redeemedAt: { type: Date, required: true },
  },
  { timestamps: true, versionKey: false },
);

CouponRedemptionSchema.index({ couponId: 1, orderId: 1 }, { unique: true });

export interface CouponPersistence {
  _id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  maxRedemptions: number | null;
  perBuyerLimit: number;
  redemptionCount: number;
  startsAt: Date;
  expiresAt: Date | null;
  active: boolean;
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

export interface CouponRedemptionPersistence {
  _id: string;
  couponId: string;
  orderId: string;
  buyerId: string;
  discountAmount: number;
  redeemedAt: Date;
}

export type CouponDocument = HydratedDocument<CouponPersistence>;
export const CouponModel = mongoose.model<CouponPersistence>('Coupon', CouponModelSchema);
export const CouponRedemptionModel = mongoose.model<CouponRedemptionPersistence>(
  'CouponRedemption',
  CouponRedemptionSchema,
);
