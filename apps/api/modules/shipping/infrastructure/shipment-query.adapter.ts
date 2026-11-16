import type { EnsureActiveShipmentResult, IShipmentQueries } from '@ecomerece/contracts';
import type { Id, ShipmentReadModel } from '@ecomerece/domain';
import type { ShippingInternalService } from '../application/shipping.internal.service';

/** Contract-facing adapter for shipment reads. */
export class ShipmentQueryAdapter implements IShipmentQueries {
  constructor(private readonly internalService: ShippingInternalService) {}

  ensureActiveById(shipmentId: Id): Promise<EnsureActiveShipmentResult> {
    return this.internalService.ensureActiveShipmentGetById(shipmentId);
  }

  findByOrderId(orderId: Id): Promise<ShipmentReadModel[]> {
    return this.internalService.getShipmentsByOrderId(orderId);
  }

  findByTrackingNumber(trackingNumber: string): Promise<ShipmentReadModel | null> {
    return this.internalService.getShipmentByTrackingNumber(trackingNumber);
  }
}
