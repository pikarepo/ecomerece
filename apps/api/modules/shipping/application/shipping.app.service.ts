import type { IEventBus } from '@ecomerece/domain/events/event-bus.interface';
import { ShipmentAggregate } from '@ecomerece/domain';
import { CarrierVO } from '@ecomerece/domain/modules/shipping/value-objects/carrier.vo';
import { ShippingMethodVO } from '@ecomerece/domain/modules/shipping/value-objects/shipping-method.vo';
import { TrackingNumberVO } from '@ecomerece/domain/modules/shipping/value-objects/tracking-number.vo';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { Money } from '@ecomerece/domain/value-objects/money.vo';
import { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import { Reason } from '@ecomerece/domain/value-objects/reason.vo';
import { FullAddressVO } from '@ecomerece/domain/value-objects/street-address.vo';
import type { AuthActor } from '@ecomerece/contracts';
import type {
  assignTrackingDtoType,
  createShipmentDtoType,
  GetAdminShipmentsQueryDto,
  GetMyShipmentsQueryDto,
  GetVendorShipmentsQueryDto,
} from '@ecomerece/shared';
import type {
  PublicShipmentTrackingReadModel,
  ShipmentListItemResponseReadModel,
} from '@ecomerece/shared';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../../errors/app-error';
import { ShipmentMapper } from '../infrastructure/shipment.mapper';
import type { ShipmentRepository } from '../infrastructure/shipment.repository';
import { ShippingMessages } from '../presentation/shipping.messages';
import type { ShippingInternalService } from './shipping.internal.service';

/**
 * Who is acting. `vendorId` is null for admin scope, which skips the ownership
 * check but is never reachable from a vendor route (that middleware always sets it).
 */
export type ShippingScope = {
  actorId: Id;
  vendorId: Id | null;
};

export type ShipmentListResult = {
  data: ShipmentListItemResponseReadModel[];
  meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
};

type ShippingPageDto = Pick<
  GetMyShipmentsQueryDto | GetVendorShipmentsQueryDto | GetAdminShipmentsQueryDto,
  'cursor' | 'limit' | 'direction'
>;

/** Only a parcel that has not left the sorting chain can still be stopped. */
function isStoppable(status: string): boolean {
  return status === 'pending' || status === 'dispatched';
}

export class ShippingApplicationService {
  constructor(
    private readonly shipmentRepo: ShipmentRepository,
    private readonly internalService: ShippingInternalService,
    private readonly eventBus: IEventBus,
  ) {}

  // ── Creation ───────────────────────────────────────────────────────────────

  async createShipment(data: createShipmentDtoType, scope: ShippingScope) {
    const orderId = Id.create(data.orderId);
    const order = await this.internalService.getActiveOrderOrThrow(orderId);
    const vendorId = this.resolveVendorId(order, data.vendorId, scope.vendorId);
    const shippingMethod = ShippingMethodVO.create(data.shippingMethod);

    const shipment = ShipmentAggregate.create({
      id: Id.create(),
      orderId,
      vendorId,
      buyerId: Id.create(order.buyerId),
      carrier: CarrierVO.create(data.carrier),
      shippingMethod,
      cost: Money.create(data.cost),
      weightGrams: Quantity.create(data.weightGrams),
      address: FullAddressVO.create(order.address),
      estimatedDelivery: data.estimatedDelivery ?? this.estimateDelivery(shippingMethod),
    });

    shipment.createShipment(scope.actorId);
    await this.shipmentRepo.Create(shipment);
    await this.eventBus.publish(shipment.pullEvents());

    return ShippingMessages.shipmentCreated(shipment);
  }

  // ── Buyer reads ────────────────────────────────────────────────────────────

  getMyShipments(page: GetMyShipmentsQueryDto, actor: AuthActor): Promise<ShipmentListResult> {
    return this.list({ buyerId: actor._id, orderId: page.orderId, status: page.status }, page);
  }

  async getMyShipmentById(shipmentId: Id, actor: AuthActor) {
    const shipment = await this.loadActiveShipment(shipmentId);

    if (!shipment.isOwnedByBuyer(Id.create(actor._id))) {
      throw new ForbiddenError('You do not own this shipment.');
    }

    return ShipmentMapper.aggregateToResponseReadModel(shipment);
  }

  // ── Vendor reads ───────────────────────────────────────────────────────────

  getVendorShipments(page: GetVendorShipmentsQueryDto, vendorId: Id): Promise<ShipmentListResult> {
    return this.list(
      { vendorId: vendorId.value, orderId: page.orderId, status: page.status },
      page,
    );
  }

  async getVendorShipmentById(shipmentId: Id, vendorId: Id) {
    const shipment = await this.loadForScope(shipmentId, { actorId: vendorId, vendorId });
    return ShipmentMapper.aggregateToResponseReadModel(shipment);
  }

  // ── Admin reads ────────────────────────────────────────────────────────────

  getAdminShipments(page: GetAdminShipmentsQueryDto): Promise<ShipmentListResult> {
    return this.list(
      {
        orderId: page.orderId,
        vendorId: page.vendorId,
        buyerId: page.buyerId,
        status: page.status,
        deleted: page.deleted ?? false,
      },
      page,
    );
  }

  async getAdminShipmentById(shipmentId: Id) {
    const shipment = await this.loadShipmentIncludingDeleted(shipmentId);
    return ShipmentMapper.aggregateToResponseReadModel(shipment);
  }

  // ── Public tracking ────────────────────────────────────────────────────────

  async trackShipment(trackingNumber: string): Promise<PublicShipmentTrackingReadModel> {
    const shipment = await this.shipmentRepo.FindByTrackingNumber(trackingNumber);

    if (!shipment) throw new NotFoundError('No shipment was found for this tracking number.');

    return ShipmentMapper.aggregateToPublicTrackingReadModel(shipment);
  }

  // ── Label and lifecycle commands ───────────────────────────────────────────

  async assignTracking(shipmentId: Id, data: assignTrackingDtoType, scope: ShippingScope) {
    const shipment = await this.loadForScope(shipmentId, scope);

    shipment.assignTracking(
      {
        carrier: CarrierVO.create(data.carrier),
        shippingMethod: ShippingMethodVO.create(data.shippingMethod),
        trackingNumber: TrackingNumberVO.create(data.trackingNumber),
        cost: Money.create(data.cost),
        estimatedDelivery: data.estimatedDelivery ?? shipment.estimatedDelivery,
      },
      scope.actorId,
    );

    return this.save(shipment, 'tracking assigned');
  }

  async dispatchShipment(shipmentId: Id, scope: ShippingScope) {
    const shipment = await this.loadForScope(shipmentId, scope);
    shipment.dispatch(scope.actorId);
    return this.save(shipment, 'dispatched');
  }

  async markInTransit(shipmentId: Id, scope: ShippingScope) {
    const shipment = await this.loadForScope(shipmentId, scope);
    shipment.markInTransit(scope.actorId);
    return this.save(shipment, 'in transit');
  }

  async markOutForDelivery(shipmentId: Id, scope: ShippingScope) {
    const shipment = await this.loadForScope(shipmentId, scope);
    shipment.markOutForDelivery(scope.actorId);
    return this.save(shipment, 'out for delivery');
  }

  async deliverShipment(shipmentId: Id, scope: ShippingScope) {
    const shipment = await this.loadForScope(shipmentId, scope);
    shipment.markDelivered(scope.actorId);
    return this.save(shipment, 'delivered');
  }

  async failShipment(shipmentId: Id, reason: Reason, scope: ShippingScope) {
    const shipment = await this.loadForScope(shipmentId, scope);
    shipment.markFailed(reason, scope.actorId);
    return this.save(shipment, 'failed');
  }

  async returnShipment(shipmentId: Id, reason: Reason, scope: ShippingScope) {
    const shipment = await this.loadForScope(shipmentId, scope);
    shipment.markReturned(reason, scope.actorId);
    return this.save(shipment, 'returned');
  }

  async cancelShipment(shipmentId: Id, reason: Reason, scope: ShippingScope) {
    const shipment = await this.loadForScope(shipmentId, scope);
    shipment.cancel(reason, scope.actorId);
    return this.save(shipment, 'cancelled');
  }

  /**
   * Reaction to `order.cancelled`: the order is authoritative, so every parcel
   * that can still be stopped is cancelled with the same reason. Delivered,
   * returned and failed parcels are left alone — the goods already moved.
   */
  async cancelShipmentsForOrder(orderId: Id, reason: Reason, actorId: Id): Promise<number> {
    const shipments = await this.shipmentRepo.FindByOrderId(orderId);
    let cancelledCount = 0;

    for (const shipment of shipments) {
      if (!isStoppable(shipment.status.status)) continue;

      shipment.cancel(reason, actorId);
      await this.shipmentRepo.Save(shipment);
      await this.eventBus.publish(shipment.pullEvents());
      cancelledCount += 1;
    }

    return cancelledCount;
  }

  // ── Soft delete / recover (admin) ──────────────────────────────────────────

  async deleteShipment(shipmentId: Id, reason: Reason, scope: ShippingScope) {
    const shipment = await this.loadShipmentIncludingDeleted(shipmentId);
    shipment.deleteShipment(reason, scope.actorId);

    await this.shipmentRepo.Save(shipment);
    await this.eventBus.publish(shipment.pullEvents());

    return ShippingMessages.shipmentDeleted(shipment, reason);
  }

  async recoverShipment(shipmentId: Id, scope: ShippingScope) {
    const shipment = await this.loadShipmentIncludingDeleted(shipmentId);
    shipment.recoverShipment(scope.actorId);

    await this.shipmentRepo.Save(shipment);
    await this.eventBus.publish(shipment.pullEvents());

    return ShippingMessages.shipmentRecovered(shipment);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private async save(shipment: ShipmentAggregate, action: string) {
    await this.shipmentRepo.Save(shipment);
    await this.eventBus.publish(shipment.pullEvents());
    return ShippingMessages.shipmentUpdated(shipment, action);
  }

  private async list(
    filter: {
      orderId?: string;
      vendorId?: string;
      buyerId?: string;
      status?: string;
      deleted?: boolean;
    },
    page: ShippingPageDto,
  ): Promise<ShipmentListResult> {
    const result = await this.shipmentRepo.FindPaginated({
      filter,
      cursor: page.cursor ? Id.create(page.cursor) : undefined,
      limit: Quantity.create(page.limit),
      direction: page.direction,
    });

    return {
      data: result.data.map(ShipmentMapper.aggregateToListItemReadModel),
      meta: result.meta,
    };
  }

  private async loadActiveShipment(shipmentId: Id): Promise<ShipmentAggregate> {
    const shipment = await this.shipmentRepo.FindById(shipmentId);

    if (!shipment || shipment.delete.isDeleted) {
      throw new NotFoundError('Shipment not found.');
    }

    return shipment;
  }

  private async loadShipmentIncludingDeleted(shipmentId: Id): Promise<ShipmentAggregate> {
    const shipment = await this.shipmentRepo.FindById(shipmentId);

    if (!shipment) throw new NotFoundError('Shipment not found.');

    return shipment;
  }

  private async loadForScope(shipmentId: Id, scope: ShippingScope): Promise<ShipmentAggregate> {
    const shipment = await this.loadActiveShipment(shipmentId);

    // A seller may only touch parcels of its own orders; admin scope has no vendor id.
    if (scope.vendorId) shipment.ensureOwnedByVendor(scope.vendorId);

    return shipment;
  }

  /**
   * A vendor route always supplies its own id. Admin creation may omit it, and
   * that is only unambiguous when the order was placed with a single vendor.
   */
  private resolveVendorId(
    order: { vendorIds: string[] },
    requestedVendorId: string | undefined,
    callerVendorId: Id | null,
  ): Id {
    const allowedVendorIds = new Set(order.vendorIds);

    if (callerVendorId) {
      if (!allowedVendorIds.has(callerVendorId.value)) {
        throw new BadRequestError('The order was not placed with this vendor.');
      }
      return callerVendorId;
    }

    if (requestedVendorId) {
      if (!allowedVendorIds.has(requestedVendorId)) {
        throw new BadRequestError('The order was not placed with this vendor.');
      }
      return Id.create(requestedVendorId);
    }

    if (order.vendorIds.length === 1) return Id.create(order.vendorIds[0]);

    throw new BadRequestError(
      'vendorId is required because the order was placed with more than one vendor.',
    );
  }

  /** Estimated delivery defaults to the service level's typical transit time. */
  private estimateDelivery(method: ShippingMethodVO): Date {
    const dayMs = 24 * 60 * 60 * 1000;
    return new Date(Date.now() + method.transitDays * dayMs);
  }
}
