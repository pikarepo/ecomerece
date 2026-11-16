export interface CouponResponseReadModel {
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
  createdAt: Date;
}

export interface CouponListItemResponseReadModel {
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

export interface CouponValidationResponseReadModel {
  code: string;
  valid: boolean;
  reason: string | null;
  discountAmount: number;
  minOrderAmount: number;
}
