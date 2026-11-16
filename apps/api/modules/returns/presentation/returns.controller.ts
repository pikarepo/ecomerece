import type { AuthActor } from '@ecomerece/contracts';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { Reason } from '@ecomerece/domain/value-objects/reason.vo';
import {
  createReturnDto,
  getAdminReturnsQuerySchema,
  getMyReturnsQuerySchema,
  getVendorReturnsQuerySchema,
  returnDecisionDto,
} from '@ecomerece/shared';
import type { Context } from 'hono';
import { z } from 'zod';
import { BaseController } from '../../../core/controller/base.controller';
import type { ReturnScope, ReturnsApplicationService } from '../application/returns.app.service';

const idSchema = z.string().trim().min(5).max(40);

/**
 * Path convention matches order and shipping: scope (`my` | `vendor` | `admin`),
 * then `all` or `:id`, then the command.
 */
export class ReturnsController extends BaseController<ReturnsApplicationService> {
  // ── Buyer ──────────────────────────────────────────────────────────────────

  createMyReturn = async (c: Context) =>
    this.created(
      c,
      await this.service.createReturn(await this.body(c, createReturnDto), this.actor(c)),
    );

  getMyReturns = async (c: Context) =>
    this.ok(
      c,
      await this.service.getMyReturns(this.query(c, getMyReturnsQuerySchema), this.actor(c)),
    );

  getMyReturnById = async (c: Context) =>
    this.ok(
      c,
      await this.service.getMyReturnById(Id.create(this.param(c, 'id', idSchema)), this.actor(c)),
    );

  cancelMyReturn = async (c: Context) =>
    this.ok(
      c,
      await this.service.cancelMyReturn(
        Id.create(this.param(c, 'id', idSchema)),
        await this.reason(c),
        Id.create(this.actor(c)._id),
      ),
    );

  // ── Vendor ─────────────────────────────────────────────────────────────────

  getVendorReturns = async (c: Context) =>
    this.ok(
      c,
      await this.service.getVendorReturns(
        this.query(c, getVendorReturnsQuerySchema),
        this.vendorId(c),
      ),
    );

  getVendorReturnById = async (c: Context) =>
    this.ok(
      c,
      await this.service.getVendorReturnById(
        Id.create(this.param(c, 'id', idSchema)),
        this.vendorId(c),
      ),
    );

  approveVendorReturn = async (c: Context) =>
    this.ok(c, await this.service.approveReturn(this.returnId(c), this.scope(c)));

  rejectVendorReturn = async (c: Context) =>
    this.ok(
      c,
      await this.service.rejectReturn(this.returnId(c), await this.reason(c), this.scope(c)),
    );

  shippedBackVendorReturn = async (c: Context) =>
    this.ok(c, await this.service.markReturnShippedBack(this.returnId(c), this.scope(c)));

  receivedVendorReturn = async (c: Context) =>
    this.ok(c, await this.service.markReturnReceived(this.returnId(c), this.scope(c)));

  // ── Admin ──────────────────────────────────────────────────────────────────

  getAdminReturns = async (c: Context) =>
    this.ok(c, await this.service.getAdminReturns(this.query(c, getAdminReturnsQuerySchema)));

  getAdminReturnById = async (c: Context) =>
    this.ok(c, await this.service.getAdminReturnById(this.returnId(c)));

  approveAdminReturn = async (c: Context) =>
    this.ok(c, await this.service.approveReturn(this.returnId(c), this.scope(c)));

  rejectAdminReturn = async (c: Context) =>
    this.ok(
      c,
      await this.service.rejectReturn(this.returnId(c), await this.reason(c), this.scope(c)),
    );

  shippedBackAdminReturn = async (c: Context) =>
    this.ok(c, await this.service.markReturnShippedBack(this.returnId(c), this.scope(c)));

  receivedAdminReturn = async (c: Context) =>
    this.ok(c, await this.service.markReturnReceived(this.returnId(c), this.scope(c)));

  cancelAdminReturn = async (c: Context) =>
    this.ok(
      c,
      await this.service.cancelReturn(this.returnId(c), await this.reason(c), this.scope(c)),
    );

  deleteReturn = async (c: Context) =>
    this.ok(
      c,
      await this.service.deleteReturn(this.returnId(c), await this.reason(c), this.scope(c)),
    );

  recoverReturn = async (c: Context) =>
    this.ok(c, await this.service.recoverReturn(this.returnId(c)));

  // ── Context helpers ────────────────────────────────────────────────────────

  private actor(c: Context): AuthActor {
    return c.get('user') as AuthActor;
  }

  private scope(c: Context): ReturnScope {
    const vendorId = c.get('vendorId') as string | undefined;

    return {
      actorId: Id.create(this.actor(c)._id),
      vendorId: vendorId ? Id.create(vendorId) : null,
    };
  }

  private vendorId(c: Context): Id {
    return Id.create(c.get('vendorId') as string);
  }

  private returnId(c: Context): Id {
    return Id.create(this.param(c, 'id', idSchema));
  }

  private async reason(c: Context): Promise<Reason> {
    const { reason } = await this.body(c, returnDecisionDto);
    return Reason.create(reason);
  }
}
