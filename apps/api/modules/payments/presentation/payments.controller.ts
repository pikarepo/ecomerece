import type { AuthActor } from '@ecomerece/contracts';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import {
  capturePaymentDto,
  createPaymentDto,
  getAdminPaymentsQuerySchema,
  getMyPaymentsQuerySchema,
  paymentReasonDto,
  refundPaymentDto,
} from '@ecomerece/shared';
import type { Context } from 'hono';
import { z } from 'zod';
import { BaseController } from '../../../core/controller/base.controller';
import type { PaymentsApplicationService } from '../application/payments.app.service';

const idSchema = z.string().trim().min(5).max(40);

export class PaymentsController extends BaseController<PaymentsApplicationService> {
  createMyPayment = async (c: Context) =>
    this.created(
      c,
      await this.service.createMyPayment(await this.body(c, createPaymentDto), this.actor(c)),
    );

  getMyPayments = async (c: Context) =>
    this.ok(
      c,
      await this.service.getMyPayments(this.query(c, getMyPaymentsQuerySchema), this.actor(c)),
    );

  getMyPaymentById = async (c: Context) =>
    this.ok(
      c,
      await this.service.getMyPaymentById(Id.create(this.param(c, 'id', idSchema)), this.actor(c)),
    );

  authorizePayment = async (c: Context) =>
    this.ok(
      c,
      await this.service.authorizePayment(Id.create(this.param(c, 'id', idSchema)), this.actor(c)),
    );

  capturePayment = async (c: Context) =>
    this.ok(
      c,
      await this.service.capturePayment(
        Id.create(this.param(c, 'id', idSchema)),
        await this.body(c, capturePaymentDto),
        this.actor(c),
      ),
    );

  cancelPayment = async (c: Context) =>
    this.ok(
      c,
      await this.service.cancelPayment(
        Id.create(this.param(c, 'id', idSchema)),
        await this.body(c, paymentReasonDto),
        this.actor(c),
      ),
    );

  getAdminPayments = async (c: Context) =>
    this.ok(c, await this.service.getAdminPayments(this.query(c, getAdminPaymentsQuerySchema)));

  getAdminPaymentById = async (c: Context) =>
    this.ok(c, await this.service.getAdminPaymentById(Id.create(this.param(c, 'id', idSchema))));

  refundAdminPayment = async (c: Context) =>
    this.ok(
      c,
      await this.service.refundPayment(
        Id.create(this.param(c, 'id', idSchema)),
        await this.body(c, refundPaymentDto),
        null,
      ),
    );

  webhook = async (c: Context) => {
    const provider = c.req.param('provider') ?? '';
    this.assert(provider.length > 0, 'Provider is required', 400);
    const payload = await c.req.json().catch(() => ({}));
    const headers: Record<string, string | undefined> = {};
    c.req.raw.headers.forEach((v, k) => (headers[k] = v));
    return this.ok(c, await this.service.handleWebhook(provider, payload, headers));
  };

  private actor(c: Context): AuthActor {
    return c.get('user') as AuthActor;
  }
}
