export interface CouponReadModel {
  id: string;
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
  deleted: {
    deleted: boolean;
    deletedFrom: Date | null;
    deletedBy: string | null;
    reason: string | null;
  };
  createdAt: Date;
}

export interface CouponListItemReadModel {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  active: boolean;
  startsAt: Date;
  expiresAt: Date | null;
  redemptionCount: number;
  createdAt: Date;
}

export interface CouponValidationReadModel {
  code: string;
  valid: boolean;
  /** Why the code was refused, or null when valid. */
  reason: string | null;
  discountAmount: number;
  minOrderAmount: number;
}
