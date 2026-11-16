import type {
  CouponRedemptionInput,
  CouponRedemptionResult,
  CouponValidationResult,
} from '@ecomerece/contracts';
import { CouponAggregate } from '@ecomerece/domain';
import type { IEventBus } from '@ecomerece/domain/events/event-bus.interface';
import { CouponCodeVO } from '@ecomerece/domain/modules/promotions/value-objects/coupon-code.vo';
import { DiscountTypeVO } from '@ecomerece/domain/modules/promotions/value-objects/discount-type.vo';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import { Reason } from '@ecomerece/domain/value-objects/reason.vo';
import type {
  CouponListItemResponseReadModel,
  CouponValidationResponseReadModel,
  createCouponDtoType,
  GetAdminCouponsQueryDto,
  updateCouponDtoType,
} from '@ecomerece/shared';
import { BadRequestError, NotFoundError } from '../../../errors/app-error';
import { CouponMapper } from '../infrastructure/coupon.mapper';
import type { CouponRepository } from '../infrastructure/coupon.repository';
import { CouponMessages } from '../presentation/promotions.messages';
import type { PromotionsInternalService } from './promotions.internal.service';

export type CouponListResult = {
  data: CouponListItemResponseReadModel[];
  meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
};

export class PromotionsApplicationService {
  constructor(
    private readonly couponRepo: CouponRepository,
    private readonly internalService: PromotionsInternalService,
    private readonly eventBus: IEventBus,
  ) {}

  // ── Admin campaign management ──────────────────────────────────────────────

  async createCoupon(data: createCouponDtoType, actorId: Id) {
    await this.internalService.assertCodeAvailable(data.code);

    const coupon = CouponAggregate.create({
      id: Id.create(),
      code: CouponCodeVO.create(data.code),
      discountType: DiscountTypeVO.create(data.discountType),
      discountValue: data.discountValue,
      minOrderAmount: data.minOrderAmount,
      maxDiscountAmount: data.maxDiscountAmount ?? null,
      maxRedemptions: data.maxRedemptions ?? null,
      perBuyerLimit: data.perBuyerLimit,
      startsAt: data.startsAt,
      expiresAt: data.expiresAt ?? null,
      active: data.active,
    });

    coupon.createCoupon(actorId);
    await this.couponRepo.Create(coupon);
    await this.eventBus.publish(coupon.pullEvents());

    return CouponMessages.created(coupon);
  }

  getAdminCoupons(page: GetAdminCouponsQueryDto): Promise<CouponListResult> {
    return this.list(
      { code: page.code, active: page.active, deleted: page.deleted ?? false },
      page,
    );
  }

  async getAdminCouponById(couponId: Id) {
    const coupon = await this.internalService.loadIncludingDeleted(couponId);
    return CouponMapper.aggregateToResponseReadModel(coupon);
  }

  /** Omitted fields keep their stored value, so a PATCH cannot blank a campaign. */
  async updateCoupon(couponId: Id, data: updateCouponDtoType, actorId: Id) {
    const coupon = await this.internalService.loadActive(couponId);
    const code = data.code ? CouponCodeVO.create(data.code) : coupon.code;

    if (data.code) await this.internalService.assertCodeAvailable(data.code, couponId);

    coupon.update(
      {
        code,
        discountType: data.discountType
          ? DiscountTypeVO.create(data.discountType)
          : coupon.discountType,
        discountValue: data.discountValue ?? coupon.discountValue,
        minOrderAmount: data.minOrderAmount ?? coupon.minOrderAmount,
        maxDiscountAmount: data.maxDiscountAmount ?? coupon.maxDiscountAmount,
        maxRedemptions: data.maxRedemptions ?? coupon.maxRedemptions,
        perBuyerLimit: data.perBuyerLimit ?? coupon.perBuyerLimit,
        startsAt: data.startsAt ?? coupon.startsAt,
        expiresAt: data.expiresAt ?? coupon.expiresAt,
        active: data.active ?? coupon.active,
      },
      actorId,
    );

    return this.save(coupon, 'updated');
  }

  async activateCoupon(couponId: Id, actorId: Id) {
    const coupon = await this.internalService.loadActive(couponId);
    coupon.activate(actorId);
    return this.save(coupon, 'activated');
  }

  async deactivateCoupon(couponId: Id, actorId: Id) {
    const coupon = await this.internalService.loadActive(couponId);
    coupon.deactivate(actorId);
    return this.save(coupon, 'deactivated');
  }

  async deleteCoupon(couponId: Id, reason: Reason, actorId: Id) {
    const coupon = await this.internalService.loadIncludingDeleted(couponId);
    coupon.deleteCoupon(reason, actorId);

    await this.couponRepo.Save(coupon);
    await this.eventBus.publish(coupon.pullEvents());

    return CouponMessages.deleted(coupon, reason);
  }

  async recoverCoupon(couponId: Id, actorId: Id) {
    const coupon = await this.internalService.loadIncludingDeleted(couponId);
    coupon.recoverCoupon(actorId);

    await this.couponRepo.Save(coupon);
    await this.eventBus.publish(coupon.pullEvents());

    return CouponMessages.recovered(coupon);
  }

  // ── Buyer-facing preview and redemption ────────────────────────────────────

  async validateCoupon(data: {
    code: string;
    subtotal: number;
    buyerId: Id;
  }): Promise<CouponValidationResponseReadModel> {
    const coupon = await this.couponRepo.FindByCode(data.code);

    if (!coupon) {
      return {
        code: data.code.trim().toUpperCase(),
        valid: false,
        reason: 'This coupon code is not recognised.',
        discountAmount: 0,
        minOrderAmount: 0,
      };
    }

    const buyerRedemptionCount = await this.couponRepo.CountRedemptionsByBuyer(
      coupon.id,
      data.buyerId,
    );
    const reason = coupon.refusalReason(data.subtotal, buyerRedemptionCount);

    return {
      code: coupon.code.value,
      valid: reason === null,
      reason,
      discountAmount: reason === null ? coupon.calculateDiscount(data.subtotal) : 0,
      minOrderAmount: coupon.minOrderAmount,
    };
  }

  /**
   * Called by checkout once the order exists. The redemption row is written
   * before the coupon counter so a retry hits the unique (coupon, order) guard
   * instead of discounting twice.
   */
  async redeem(input: CouponRedemptionInput): Promise<CouponRedemptionResult> {
    const coupon = await this.couponRepo.FindByCode(input.code);

    if (!coupon || coupon.delete.isDeleted) {
      throw new NotFoundError('Coupon not found.');
    }
    if (await this.couponRepo.HasRedeemed(coupon.id, input.orderId)) {
      throw new BadRequestError('This order has already redeemed this coupon.');
    }

    const buyerRedemptionCount = await this.couponRepo.CountRedemptionsByBuyer(
      coupon.id,
      input.buyerId,
    );

    const discountAmount = coupon.redeem({
      buyerId: input.buyerId,
      orderId: input.orderId,
      subtotal: input.subtotal,
      buyerRedemptionCount,
      actorId: input.buyerId,
    });

    await this.couponRepo.CreateRedemption({
      couponId: coupon.id,
      orderId: input.orderId,
      buyerId: input.buyerId,
      discountAmount,
    });
    await this.couponRepo.Save(coupon);
    await this.eventBus.publish(coupon.pullEvents());

    return { couponId: coupon.id, discountAmount };
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private async save(coupon: CouponAggregate, action: string) {
    await this.couponRepo.Save(coupon);
    await this.eventBus.publish(coupon.pullEvents());
    return CouponMessages.updated(coupon, action);
  }

  private async list(
    filter: { code?: string; active?: boolean; deleted?: boolean },
    page: Pick<GetAdminCouponsQueryDto, 'cursor' | 'limit' | 'direction'>,
  ): Promise<CouponListResult> {
    const result = await this.couponRepo.FindPaginated({
      filter,
      cursor: page.cursor ? Id.create(page.cursor) : undefined,
      limit: Quantity.create(page.limit),
      direction: page.direction,
    });

    return {
      data: result.data.map(CouponMapper.aggregateToListItemReadModel),
      meta: result.meta,
    };
  }
}
