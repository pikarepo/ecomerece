import {
  CouponAggregate,
  type CouponListItemReadModel,
  type CouponReadModel,
} from '@ecomerece/domain';
import { CouponCodeVO } from '@ecomerece/domain/modules/promotions/value-objects/coupon-code.vo';
import { DiscountTypeVO } from '@ecomerece/domain/modules/promotions/value-objects/discount-type.vo';
import { DeleteInfoVO } from '@ecomerece/domain/value-objects/delete-info.vo';
import { EffectiveDate } from '@ecomerece/domain/value-objects/effective-date.vo';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import { Reason } from '@ecomerece/domain/value-objects/reason.vo';
import type { CouponListItemResponseReadModel, CouponResponseReadModel } from '@ecomerece/shared';
import type { CouponPersistence } from './coupon.model';

function toDate(value: Date | null): Date | null {
  return value ? new Date(value) : null;
}

export const CouponMapper = {
  persistenceToAggregate(doc: CouponPersistence): CouponAggregate {
    return CouponAggregate.rehydrate(
      Id.create(doc._id),
      CouponCodeVO.rehydrate(doc.code),
      DiscountTypeVO.rehydrate(doc.discountType),
      doc.discountValue,
      doc.minOrderAmount,
      doc.maxDiscountAmount ?? null,
      doc.maxRedemptions ?? null,
      doc.perBuyerLimit,
      doc.redemptionCount,
      doc.startsAt,
      toDate(doc.expiresAt),
      doc.active,
      DeleteInfoVO.rehydrate(
        doc.deleted.deletedBy ? Id.create(doc.deleted.deletedBy) : null,
        doc.deleted.deleted,
        doc.deleted.deletedFrom ? EffectiveDate.rehydrate(doc.deleted.deletedFrom) : null,
        doc.deleted.reason ? Reason.create(doc.deleted.reason) : null,
      ),
      Quantity.rehydrate(doc.version),
      EffectiveDate.rehydrate(doc.createdAt),
    );
  },

  aggregateToPersistence(coupon: CouponAggregate) {
    return {
      _id: coupon.id.value,
      code: coupon.code.value,
      discountType: coupon.discountType.value,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscountAmount: coupon.maxDiscountAmount,
      maxRedemptions: coupon.maxRedemptions,
      perBuyerLimit: coupon.perBuyerLimit,
      redemptionCount: coupon.redemptionCount,
      startsAt: coupon.startsAt,
      expiresAt: coupon.expiresAt,
      active: coupon.active,
      version: coupon.version.value,
      deleted: {
        deleted: coupon.delete.deleted,
        deletedFrom: coupon.delete.from?.value ?? null,
        deletedBy: coupon.delete.performedBy?.value ?? null,
        reason: coupon.delete.reason?.value ?? null,
      },
      createdAt: coupon.createdAt.value,
      updatedAt: EffectiveDate.today().value,
    };
  },

  aggregateToReadModel(coupon: CouponAggregate): CouponReadModel {
    return {
      id: coupon.id.value,
      code: coupon.code.value,
      discountType: coupon.discountType.value,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscountAmount: coupon.maxDiscountAmount,
      maxRedemptions: coupon.maxRedemptions,
      perBuyerLimit: coupon.perBuyerLimit,
      redemptionCount: coupon.redemptionCount,
      startsAt: coupon.startsAt,
      expiresAt: coupon.expiresAt,
      active: coupon.active,
      deleted: {
        deleted: coupon.delete.deleted,
        deletedFrom: coupon.delete.from?.value ?? null,
        deletedBy: coupon.delete.performedBy?.value ?? null,
        reason: coupon.delete.reason?.value ?? null,
      },
      createdAt: coupon.createdAt.value,
    };
  },

  persistenceToReadModel(doc: CouponPersistence): CouponReadModel {
    return {
      id: doc._id,
      code: doc.code,
      discountType: doc.discountType,
      discountValue: doc.discountValue,
      minOrderAmount: doc.minOrderAmount,
      maxDiscountAmount: doc.maxDiscountAmount ?? null,
      maxRedemptions: doc.maxRedemptions ?? null,
      perBuyerLimit: doc.perBuyerLimit,
      redemptionCount: doc.redemptionCount,
      startsAt: doc.startsAt,
      expiresAt: toDate(doc.expiresAt),
      active: doc.active,
      deleted: {
        deleted: doc.deleted.deleted,
        deletedFrom: doc.deleted.deletedFrom ?? null,
        deletedBy: doc.deleted.deletedBy ?? null,
        reason: doc.deleted.reason ?? null,
      },
      createdAt: doc.createdAt,
    };
  },

  aggregateToResponseReadModel(coupon: CouponAggregate): CouponResponseReadModel {
    return {
      id: coupon.id.value,
      code: coupon.code.value,
      discountType: coupon.discountType.value,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscountAmount: coupon.maxDiscountAmount,
      maxRedemptions: coupon.maxRedemptions,
      perBuyerLimit: coupon.perBuyerLimit,
      redemptionCount: coupon.redemptionCount,
      startsAt: coupon.startsAt,
      expiresAt: coupon.expiresAt,
      active: coupon.active,
      createdAt: coupon.createdAt.value,
    };
  },

  aggregateToListItemReadModel(coupon: CouponAggregate): CouponListItemResponseReadModel {
    return {
      id: coupon.id.value,
      code: coupon.code.value,
      discountType: coupon.discountType.value,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      active: coupon.active,
      startsAt: coupon.startsAt,
      expiresAt: coupon.expiresAt,
      redemptionCount: coupon.redemptionCount,
      createdAt: coupon.createdAt.value,
    };
  },
};
