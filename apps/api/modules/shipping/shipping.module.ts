import type { IOrderQueries } from '@ecomerece/contracts';
import type { Buses } from '../../core/infrastructure/buses/buses';
import { OrderCancelledHandler } from './application/event-handlers/order-cancelled.handler';
import { ShippingApplicationService } from './application/shipping.app.service';
import { ShippingInternalService } from './application/shipping.internal.service';
import { ShipmentQueryAdapter } from './infrastructure/shipment-query.adapter';
import { ShipmentRepository } from './infrastructure/shipment.repository';
import { ShippingController } from './presentation/shipping.controller';

interface ShippingModuleDeps extends Buses {
  /** Orders are only read: vendor split, buyer and delivery address come from there. */
  orderQueries: IOrderQueries;
}

export function createShippingModule({ eventBus, orderQueries }: ShippingModuleDeps) {
  const shipmentRepo = new ShipmentRepository();
  const internalService = new ShippingInternalService(shipmentRepo, orderQueries);
  const appService = new ShippingApplicationService(shipmentRepo, internalService, eventBus);
  const controller = new ShippingController(appService);

  // Cancelling an order stops every parcel of it that has not moved yet.
  eventBus.register('order.cancelled', new OrderCancelledHandler(appService));

  return {
    controller,
    queries: new ShipmentQueryAdapter(internalService),
  };
}
