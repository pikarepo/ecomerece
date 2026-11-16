import type { AuthActor } from '@ecomerece/contracts';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import {
  getAdminPayoutsQuerySchema,
  getLedgerQuerySchema,
  getPayoutsQuerySchema,
  payoutActionDto,
  requestPayoutDto,
} from '@ecomerece/shared';
import type { Context } from 'hono';
import { z } from 'zod';
import { BaseController } from '../../../core/controller/base.controller';
import type { PayoutsApplicationService } from '../application/payouts.app.service';

const idSchema = z.string().trim().min(5).max(40);

export class PayoutsController extends BaseController<PayoutsApplicationService> {
  getMyBalance = async (c: Context) => this.ok(c, await this.service.getMyBalance(this.actor(c)));
  getMyLedger = async (c: Context) =>
    this.ok(c, await this.service.getMyLedger(this.query(c, getLedgerQuerySchema), this.actor(c)));
  requestPayout = async (c: Context) =>
    this.created(
      c,
      await this.service.requestPayout(await this.body(c, requestPayoutDto), this.actor(c)),
    );
  getMyPayouts = async (c: Context) =>
    this.ok(
      c,
      await this.service.getMyPayouts(this.query(c, getPayoutsQuerySchema), this.actor(c)),
    );

  getAdminPayouts = async (c: Context) =>
    this.ok(c, await this.service.getAdminPayouts(this.query(c, getAdminPayoutsQuerySchema)));
  getAdminBalance = async (c: Context) =>
    this.ok(c, await this.service.getVendorBalance(Id.create(this.param(c, 'vendorId', idSchema))));
  approvePayout = async (c: Context) =>
    this.ok(
      c,
      await this.service.approvePayout(
        Id.create(this.param(c, 'id', idSchema)),
        Id.create(this.actor(c)._id),
      ),
    );
  markPaid = async (c: Context) => {
    const data = await this.body(c, payoutActionDto);
    return this.ok(
      c,
      await this.service.markPaid(
        Id.create(this.param(c, 'id', idSchema)),
        data.providerRef ?? null,
      ),
    );
  };
  failPayout = async (c: Context) => {
    const data = await this.body(c, payoutActionDto);
    return this.ok(
      c,
      await this.service.failPayout(
        Id.create(this.param(c, 'id', idSchema)),
        data.reason ?? 'failed',
      ),
    );
  };
  cancelAdminPayout = async (c: Context) => {
    const data = await this.body(c, payoutActionDto);
    return this.ok(
      c,
      await this.service.cancelPayout(
        Id.create(this.param(c, 'id', idSchema)),
        data.reason ?? null,
      ),
    );
  };

  private actor(c: Context): AuthActor {
    return c.get('user') as AuthActor;
  }
}
