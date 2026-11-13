import type {
  IAddressQueries,
  IInventoryReservation,
  IOrderItemsWriter,
  IProductQueries,
  IProductVariantQueries,
} from '@ecomerece/contracts';
import type { Buses } from '../../core/infrastructure/buses/buses';
import type { UnitOfWork } from '../../core/database/unit-of-work';
import { OrderApplicationService } from './application/order.app.service';
import { OrderInternalService } from './application/order.internal.service';
import { OrderQueryAdapter } from './infrastructure/order-query.adapter';
import { OrderRepository } from './infrastructure/order.repository';
import { OrderController } from './presentation/order.controller';

interface OrderModuleDeps extends Buses {
  inventoryReservation: IInventoryReservation;
  orderItemsWriter: IOrderItemsWriter;
  addressQueries: IAddressQueries;
  variantQueries: IProductVariantQueries;
  productQueries: IProductQueries;
  unitOfWork: UnitOfWork;
}

export function createOrder({
  eventBus,
  inventoryReservation,
  orderItemsWriter,
  addressQueries,
  variantQueries,
  productQueries,
  unitOfWork,
}: OrderModuleDeps) {
  const orderRepo = new OrderRepository();
  const orderInternalService = new OrderInternalService(orderRepo);
  const orderApplicationService = new OrderApplicationService(
    orderRepo,
    addressQueries,
    variantQueries,
    productQueries,
    eventBus,
    inventoryReservation,
    orderItemsWriter,
    new OrderQueryAdapter(orderInternalService),
    unitOfWork,
  );
  const orderController = new OrderController(orderApplicationService);
  const queries = new OrderQueryAdapter(orderInternalService);
  return { orderController, queries };
}
