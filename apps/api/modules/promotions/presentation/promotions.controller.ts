import type { AuthActor } from '@ecomerece/contracts';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { Reason } from '@ecomerece/domain/value-objects/reason.vo';
import {
  couponReasonDto,
  createCouponDto,
  getAdminCouponsQuerySchema,
  updateCouponDto,
  validateCouponDto,
} from '@ecomerece/shared';
import type { Context } from 'hono';
import { z } from 'zod';
import { BaseController } from '../../../core/controller/base.controller';
import type { PromotionsApplicationService } from '../application/promotions.app.service';

const idSchema = z.string().trim().min(5).max(40);

export class PromotionsController extends BaseController<PromotionsApplicationService> {
  // ── Buyer ──────────────────────────────────────────────────────────────────

  validateCoupon = async (c: Context) => {
    const data = await this.body(c, validateCouponDto);
    const actor = this.actor(c);

    return this.ok(
      c,
      await this.service.validateCoupon({
        code: data.code,
        subtotal: data.subtotal,
        buyerId: Id.create(actor._id),
      }),
    );
  };

  // ── Admin ──────────────────────────────────────────────────────────────────

  createCoupon = async (c: Context) =>
    this.created(
      c,
      await this.service.createCoupon(await this.body(c, createCouponDto), this.actorId(c)),
    );

  getAdminCoupons = async (c: Context) =>
    this.ok(c, await this.service.getAdminCoupons(this.query(c, getAdminCouponsQuerySchema)));

  getAdminCouponById = async (c: Context) =>
    this.ok(c, await this.service.getAdminCouponById(this.couponId(c)));

  updateCoupon = async (c: Context) =>
    this.ok(
      c,
      await this.service.updateCoupon(
        this.couponId(c),
        await this.body(c, updateCouponDto),
        this.actorId(c),
      ),
    );

  activateCoupon = async (c: Context) =>
    this.ok(c, await this.service.activateCoupon(this.couponId(c), this.actorId(c)));

  deactivateCoupon = async (c: Context) =>
    this.ok(c, await this.service.deactivateCoupon(this.couponId(c), this.actorId(c)));

  deleteCoupon = async (c: Context) =>
    this.ok(
      c,
      await this.service.deleteCoupon(this.couponId(c), await this.reason(c), this.actorId(c)),
    );

  recoverCoupon = async (c: Context) =>
    this.ok(c, await this.service.recoverCoupon(this.couponId(c), this.actorId(c)));

  // ── Context helpers ────────────────────────────────────────────────────────

  private actor(c: Context): AuthActor {
    return c.get('user') as AuthActor;
  }

  private actorId(c: Context): Id {
    return Id.create(this.actor(c)._id);
  }

  private couponId(c: Context): Id {
    return Id.create(this.param(c, 'id', idSchema));
  }

  private async reason(c: Context): Promise<Reason> {
    const { reason } = await this.body(c, couponReasonDto);
    return Reason.create(reason);
  }
}
