import type { IOrderQueries } from '@ecomerece/contracts';
import type { Buses } from '../../core/infrastructure/buses/buses';
import type { UnitOfWork } from '../../core/database/unit-of-work';
import { OrderItemsApplicationService } from './application/order-item.app.service';
import { OrderItemsInternalService } from './application/order-item.internal';
import { OrderItemsQueryAdapter } from './infrastructure/order-items-query.adapter';
import { OrderItemsRepository } from './infrastructure/order-item.repository';
import { OrderItemsWriterAdapter } from './infrastructure/order-items-writer.adapter';
import { OrderItemsController } from './presentation/order-items.controller';

/**
 * Order-items core: persistence, internal service, writer, and read port.
 *
 * It deliberately has no dependency on the order module, which lets the
 * composition root build it before the order module and pass its writer/read
 * port into order without a circular dependency or lazy resolution.
 */
export function createOrderItemsCore() {
  const itemsRepo = new OrderItemsRepository();
  const internalService = new OrderItemsInternalService(itemsRepo);
  const orderItemsWriter = new OrderItemsWriterAdapter(internalService);
  const queries = new OrderItemsQueryAdapter(internalService);

  return { itemsRepo, internalService, orderItemsWriter, queries };
}

interface OrderItemsApplicationDeps extends Buses {
  core: ReturnType<typeof createOrderItemsCore>;
  orderQueries: IOrderQueries;
  unitOfWork: UnitOfWork;
}

/** Order-items presentation/use cases, built after the order module exists. */
export function createOrderItemsApplication({
  core,
  orderQueries,
  eventBus,
  unitOfWork,
}: OrderItemsApplicationDeps) {
  const applicationService = new OrderItemsApplicationService(
    core.internalService,
    core.itemsRepo,
    orderQueries,
    eventBus,
    unitOfWork,
  );
  const orderItemsController = new OrderItemsController(applicationService);

  return { orderItemsController };
}
