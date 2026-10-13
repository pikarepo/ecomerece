import { commandBus } from '../../core/infrastructure/buses/in-memory-command-bus';
import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { queryBus } from '../../core/infrastructure/buses/in-memory-query-bus';
import { orderItemsRoutes } from '../order-items/presentation/order-items.routes';
import { OrderApplicationService } from './application/order.app.service';
import { OrderInternalService } from './application/order.internal.service';
import { EnsureActiveOrderGetByIdQuery } from './application/queries/ensure-active-order-get-by-id.query';
import { EnsureActiveOrderGetByIdHandler } from './application/query-handler/ensure-active-order-get-by-id.query-handler';
import { OrderRepository } from './infrastructure/order.repository';
import { OrderController } from './presentation/order.controller';

export function createOrder() {
  const orderRepo = new OrderRepository();
  const orderInternalService = new OrderInternalService(orderRepo);
  const orderApplicationService = new OrderApplicationService(
    orderRepo,
    queryBus,
    eventBus,
    commandBus,
  );
  queryBus.register(
    EnsureActiveOrderGetByIdQuery,
    new EnsureActiveOrderGetByIdHandler(orderInternalService),
  );
  const orderController = new OrderController(orderApplicationService);
  return { orderController };
}
