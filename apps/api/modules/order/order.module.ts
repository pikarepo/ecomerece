import type { IInventoryReservation, IOrderItemsWriter } from '@ecomerece/contracts';
import type { Buses } from '../../core/infrastructure/buses/buses';
import type { UnitOfWork } from '../../core/database/unit-of-work';
import { OrderApplicationService } from './application/order.app.service';
import { OrderInternalService } from './application/order.internal.service';
import { EnsureActiveOrderGetByIdQuery } from './application/queries/ensure-active-order-get-by-id.query';
import { GetAdminPaginatedOrdersQuery } from './application/queries/get-admin-paginated-orders.query';
import { GetMyOrdersQuery } from './application/queries/get-my-orders.query';
import { GetOrderByIdQuery } from './application/queries/get-order-by-id.query';
import { EnsureActiveOrderGetByIdHandler } from './application/query-handler/ensure-active-order-get-by-id.query-handler';
import { GetAdminPaginatedOrdersHandler } from './application/query-handler/get-admin-paginated-orders.query-handler';
import { GetMyOrdersHandler } from './application/query-handler/get-my-orders.query-handler';
import { GetOrderByIdHandler } from './application/query-handler/get-order-by-id.query-handler';
import { OrderRepository } from './infrastructure/order.repository';
import { OrderController } from './presentation/order.controller';

interface OrderModuleDeps extends Buses {
  inventoryReservation: IInventoryReservation;
  orderItemsWriter: IOrderItemsWriter;
  unitOfWork: UnitOfWork;
}

export function createOrder({
  queryBus,
  eventBus,
  inventoryReservation,
  orderItemsWriter,
  unitOfWork,
}: OrderModuleDeps) {
  const orderRepo = new OrderRepository();
  const orderInternalService = new OrderInternalService(orderRepo);
  const orderApplicationService = new OrderApplicationService(
    orderRepo,
    queryBus,
    eventBus,
    inventoryReservation,
    orderItemsWriter,
    unitOfWork,
  );
  queryBus.register(
    EnsureActiveOrderGetByIdQuery,
    new EnsureActiveOrderGetByIdHandler(orderInternalService),
  );
  queryBus.register(GetOrderByIdQuery, new GetOrderByIdHandler(orderInternalService));
  queryBus.register(GetMyOrdersQuery, new GetMyOrdersHandler(orderApplicationService));
  queryBus.register(
    GetAdminPaginatedOrdersQuery,
    new GetAdminPaginatedOrdersHandler(orderApplicationService),
  );
  const orderController = new OrderController(orderApplicationService);
  return { orderController };
}
