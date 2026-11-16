import type { CouponAggregate } from '@ecomerece/domain';
import { EffectiveDate } from '@ecomerece/domain/value-objects/effective-date.vo';
import type { Reason } from '@ecomerece/domain/value-objects/reason.vo';
import type { CouponResponseReadModel } from '@ecomerece/shared';
import { CouponMapper } from '../infrastructure/coupon.mapper';

export type CouponMessagesType = {
  message: string;
  updatedData: CouponResponseReadModel;
};

export const CouponMessages = {
  created(coupon: CouponAggregate): CouponMessagesType {
    return {
      updatedData: CouponMapper.aggregateToResponseReadModel(coupon),
      message: `Coupon ${coupon.code.value} (${coupon.discountType.value} ${coupon.discountValue}) was created on ${EffectiveDate.today().value}.`,
    };
  },
  updated(coupon: CouponAggregate, action: string): CouponMessagesType {
    return {
      updatedData: CouponMapper.aggregateToResponseReadModel(coupon),
      message: `Coupon ${coupon.code.value} was ${action} on ${EffectiveDate.today().value}.`,
    };
  },
  deleted(coupon: CouponAggregate, reason: Reason): CouponMessagesType {
    return {
      updatedData: CouponMapper.aggregateToResponseReadModel(coupon),
      message: `Coupon ${coupon.code.value} was deleted on ${EffectiveDate.today().value}. Reason: ${reason.value}.`,
    };
  },
  recovered(coupon: CouponAggregate): CouponMessagesType {
    return {
      updatedData: CouponMapper.aggregateToResponseReadModel(coupon),
      message: `Coupon ${coupon.code.value} was recovered on ${EffectiveDate.today().value}.`,
    };
  },
};
