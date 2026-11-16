import type { EnsureActiveShipmentResult, IOrderQueries } from '@ecomerece/contracts';
import type { Id, OrderReadModel, ShipmentReadModel } from '@ecomerece/domain';
import { NotFoundError } from '../../../errors/app-error';
import { ShipmentMapper } from '../infrastructure/shipment.mapper';
import type { ShipmentRepository } from '../infrastructure/shipment.repository';

/**
 * Logic shared by 2+ shipping use cases: loading a shipment/order with the
 * checks every use case needs, and shaping read models for other modules.
 */
export class ShippingInternalService {
  constructor(
    private readonly shipmentRepo: ShipmentRepository,
    private readonly orderQueries: IOrderQueries,
  ) {}

  async getShipmentById(shipmentId: Id): Promise<ShipmentReadModel | null> {
    const shipment = await this.shipmentRepo.FindById(shipmentId);
    return shipment ? ShipmentMapper.aggregateToReadModel(shipment) : null;
  }

  async ensureActiveShipmentGetById(shipmentId: Id): Promise<EnsureActiveShipmentResult> {
    const shipment = await this.getShipmentById(shipmentId);

    if (!shipment || shipment.deleted.deleted) {
      return { shipment: null, active: false };
    }

    return { shipment, active: true };
  }

  async getShipmentsByOrderId(orderId: Id): Promise<ShipmentReadModel[]> {
    const shipments = await this.shipmentRepo.FindByOrderId(orderId);
    return shipments.map(ShipmentMapper.aggregateToReadModel);
  }

  async getShipmentByTrackingNumber(trackingNumber: string): Promise<ShipmentReadModel | null> {
    const shipment = await this.shipmentRepo.FindByTrackingNumber(trackingNumber);
    return shipment ? ShipmentMapper.aggregateToReadModel(shipment) : null;
  }

  /**
   * Shipping may only be created for an order that is still live. The order
   * module owns that verdict, so it is asked through its contract query.
   */
  async getActiveOrderOrThrow(orderId: Id): Promise<OrderReadModel> {
    const result = await this.orderQueries.ensureActiveById(orderId);

    if (!result.order || !result.active) {
      throw new NotFoundError('Order not found or no longer active.');
    }

    return result.order;
  }
}
