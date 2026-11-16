import type { CouponAggregate, CouponReadModel } from '@ecomerece/domain';
import type { Id } from '@ecomerece/domain/value-objects';
import { BadRequestError, NotFoundError } from '../../../errors/app-error';
import { CouponMapper } from '../infrastructure/coupon.mapper';
import type { CouponRepository } from '../infrastructure/coupon.repository';

export class PromotionsInternalService {
  constructor(private readonly couponRepo: CouponRepository) {}

  async getCouponById(couponId: Id): Promise<CouponReadModel | null> {
    const coupon = await this.couponRepo.FindById(couponId);
    return coupon ? CouponMapper.aggregateToReadModel(coupon) : null;
  }

  async loadActive(couponId: Id): Promise<CouponAggregate> {
    const coupon = await this.couponRepo.FindById(couponId);

    if (!coupon || coupon.delete.isDeleted) {
      throw new NotFoundError('Coupon not found.');
    }

    return coupon;
  }

  async loadIncludingDeleted(couponId: Id): Promise<CouponAggregate> {
    const coupon = await this.couponRepo.FindById(couponId);

    if (!coupon) throw new NotFoundError('Coupon not found.');

    return coupon;
  }

  /** The unique code index backs this up, but a clear 400 beats a duplicate-key error. */
  async assertCodeAvailable(code: string, exceptCouponId?: Id): Promise<void> {
    const existing = await this.couponRepo.FindByCode(code);

    if (existing && existing.id.value !== exceptCouponId?.value) {
      throw new BadRequestError(`Coupon code ${existing.code.value} is already in use.`);
    }
  }
}
