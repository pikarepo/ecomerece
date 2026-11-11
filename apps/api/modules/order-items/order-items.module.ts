import type { Buses } from '../../core/infrastructure/buses/buses';
import type { UnitOfWork } from '../../core/database/unit-of-work';
import { OrderItemsApplicationService } from './application/order-item.app.service';
import { OrderItemsInternalService } from './application/order-item.internal';
import { GetAdminPaginatedOrderItemsQuery } from './application/queries/get-admin-paginated-order-items.query';
import { GetOrderItemByIdQuery } from './application/queries/get-order-item-by-id.query';
import { GetOrderItemsByOrderIdQuery } from './application/queries/get-order-items-by-order-id.query';
import { GetAdminPaginatedOrderItemsHandler } from './application/query-handlers/get-admin-paginated-order-items.query-handler';
import { GetOrderItemByIdHandler } from './application/query-handlers/get-order-item-by-id.query-handler';
import { GetOrderItemsByOrderIdHandler } from './application/query-handlers/get-order-items-by-order-id.query-handler';
import { OrderItemsRepository } from './infrastructure/order-item.repository';
import { OrderItemsWriterAdapter } from './infrastructure/order-items-writer.adapter';
import { OrderItemsController } from './presentation/order-items.controller';

interface OrderItemsModuleDeps extends Buses {
  unitOfWork: UnitOfWork;
}

export function createOrderItemsModule({
  queryBus,
  eventBus,
  unitOfWork,
}: OrderItemsModuleDeps) {
  const itemsRepo = new OrderItemsRepository();
  const orderItemsInternalService = new OrderItemsInternalService(itemsRepo);
  const orderItemsWriter = new OrderItemsWriterAdapter(orderItemsInternalService);
  const orderItemsApplicationService = new OrderItemsApplicationService(
    orderItemsInternalService,
    itemsRepo,
    queryBus,
    eventBus,
    unitOfWork,
  );

  queryBus.register(
    GetOrderItemByIdQuery,
    new GetOrderItemByIdHandler(orderItemsInternalService),
  );
  queryBus.register(
    GetOrderItemsByOrderIdQuery,
    new GetOrderItemsByOrderIdHandler(orderItemsInternalService),
  );
  queryBus.register(
    GetAdminPaginatedOrderItemsQuery,
    new GetAdminPaginatedOrderItemsHandler(orderItemsApplicationService),
  );

  const orderItemsController = new OrderItemsController(orderItemsApplicationService);

  return { orderItemsWriter, orderItemsController };
}
