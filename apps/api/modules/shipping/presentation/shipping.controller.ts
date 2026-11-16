import type { AuthActor } from '@ecomerece/contracts';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { Reason } from '@ecomerece/domain/value-objects/reason.vo';
import {
  assignTrackingDto,
  createShipmentDto,
  getAdminShipmentsQuerySchema,
  getMyShipmentsQuerySchema,
  getVendorShipmentsQuerySchema,
  shipmentReasonDto,
} from '@ecomerece/shared';
import type { Context } from 'hono';
import { z } from 'zod';
import { BaseController } from '../../../core/controller/base.controller';
import type {
  ShippingApplicationService,
  ShippingScope,
} from '../application/shipping.app.service';

const idSchema = z.string().trim().min(5).max(40);
const trackingNumberSchema = z.string().trim().min(6).max(40);

/**
 * Path convention matches order: scope (`my` | `vendor` | `admin`), then `all`
 * or `:id`, then the command. Every audience gets its own route.
 */
export class ShippingController extends BaseController<ShippingApplicationService> {
  // ── Public ─────────────────────────────────────────────────────────────────

  trackShipment = async (c: Context) =>
    this.ok(
      c,
      await this.service.trackShipment(this.param(c, 'trackingNumber', trackingNumberSchema)),
    );

  // ── Buyer ──────────────────────────────────────────────────────────────────

  getMyShipments = async (c: Context) =>
    this.ok(
      c,
      await this.service.getMyShipments(this.query(c, getMyShipmentsQuerySchema), this.actor(c)),
    );

  getMyShipmentById = async (c: Context) =>
    this.ok(
      c,
      await this.service.getMyShipmentById(Id.create(this.param(c, 'id', idSchema)), this.actor(c)),
    );

  // ── Vendor ─────────────────────────────────────────────────────────────────

  getVendorShipments = async (c: Context) =>
    this.ok(
      c,
      await this.service.getVendorShipments(
        this.query(c, getVendorShipmentsQuerySchema),
        this.vendorId(c),
      ),
    );

  getVendorShipmentById = async (c: Context) =>
    this.ok(
      c,
      await this.service.getVendorShipmentById(
        Id.create(this.param(c, 'id', idSchema)),
        this.vendorId(c),
      ),
    );

  createVendorShipment = async (c: Context) =>
    this.created(
      c,
      await this.service.createShipment(await this.body(c, createShipmentDto), this.scope(c)),
    );

  assignVendorTracking = async (c: Context) =>
    this.ok(
      c,
      await this.service.assignTracking(
        this.shipmentId(c),
        await this.body(c, assignTrackingDto),
        this.scope(c),
      ),
    );

  dispatchVendorShipment = async (c: Context) =>
    this.ok(c, await this.service.dispatchShipment(this.shipmentId(c), this.scope(c)));

  inTransitVendorShipment = async (c: Context) =>
    this.ok(c, await this.service.markInTransit(this.shipmentId(c), this.scope(c)));

  outForDeliveryVendorShipment = async (c: Context) =>
    this.ok(c, await this.service.markOutForDelivery(this.shipmentId(c), this.scope(c)));

  deliverVendorShipment = async (c: Context) =>
    this.ok(c, await this.service.deliverShipment(this.shipmentId(c), this.scope(c)));

  failVendorShipment = async (c: Context) =>
    this.ok(
      c,
      await this.service.failShipment(this.shipmentId(c), await this.reason(c), this.scope(c)),
    );

  returnVendorShipment = async (c: Context) =>
    this.ok(
      c,
      await this.service.returnShipment(this.shipmentId(c), await this.reason(c), this.scope(c)),
    );

  cancelVendorShipment = async (c: Context) =>
    this.ok(
      c,
      await this.service.cancelShipment(this.shipmentId(c), await this.reason(c), this.scope(c)),
    );

  // ── Admin ──────────────────────────────────────────────────────────────────

  getAdminShipments = async (c: Context) =>
    this.ok(c, await this.service.getAdminShipments(this.query(c, getAdminShipmentsQuerySchema)));

  getAdminShipmentById = async (c: Context) =>
    this.ok(c, await this.service.getAdminShipmentById(this.shipmentId(c)));

  createAdminShipment = async (c: Context) =>
    this.created(
      c,
      await this.service.createShipment(await this.body(c, createShipmentDto), this.scope(c)),
    );

  assignAdminTracking = async (c: Context) =>
    this.ok(
      c,
      await this.service.assignTracking(
        this.shipmentId(c),
        await this.body(c, assignTrackingDto),
        this.scope(c),
      ),
    );

  dispatchAdminShipment = async (c: Context) =>
    this.ok(c, await this.service.dispatchShipment(this.shipmentId(c), this.scope(c)));

  inTransitAdminShipment = async (c: Context) =>
    this.ok(c, await this.service.markInTransit(this.shipmentId(c), this.scope(c)));

  outForDeliveryAdminShipment = async (c: Context) =>
    this.ok(c, await this.service.markOutForDelivery(this.shipmentId(c), this.scope(c)));

  deliverAdminShipment = async (c: Context) =>
    this.ok(c, await this.service.deliverShipment(this.shipmentId(c), this.scope(c)));

  failAdminShipment = async (c: Context) =>
    this.ok(
      c,
      await this.service.failShipment(this.shipmentId(c), await this.reason(c), this.scope(c)),
    );

  returnAdminShipment = async (c: Context) =>
    this.ok(
      c,
      await this.service.returnShipment(this.shipmentId(c), await this.reason(c), this.scope(c)),
    );

  cancelAdminShipment = async (c: Context) =>
    this.ok(
      c,
      await this.service.cancelShipment(this.shipmentId(c), await this.reason(c), this.scope(c)),
    );

  deleteShipment = async (c: Context) =>
    this.ok(
      c,
      await this.service.deleteShipment(this.shipmentId(c), await this.reason(c), this.scope(c)),
    );

  recoverShipment = async (c: Context) =>
    this.ok(c, await this.service.recoverShipment(this.shipmentId(c), this.scope(c)));

  // ── Context helpers ────────────────────────────────────────────────────────

  private actor(c: Context): AuthActor {
    return c.get('user') as AuthActor;
  }

  private scope(c: Context): ShippingScope {
    const vendorId = c.get('vendorId') as string | undefined;

    return {
      actorId: Id.create(this.actor(c)._id),
      // Only vendor routes run vendorMiddleware; admin routes always pass null.
      vendorId: vendorId ? Id.create(vendorId) : null,
    };
  }

  private vendorId(c: Context): Id {
    return Id.create(c.get('vendorId') as string);
  }

  private shipmentId(c: Context): Id {
    return Id.create(this.param(c, 'id', idSchema));
  }

  private async reason(c: Context): Promise<Reason> {
    const { reason } = await this.body(c, shipmentReasonDto);
    return Reason.create(reason);
  }
}
