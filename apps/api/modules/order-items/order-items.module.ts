import { UnitOfWork } from '../../core/database/unit-of-work';
import { commandBus } from '../../core/infrastructure/buses/in-memory-command-bus';
import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';

import { CreateItemsHandler } from './application/command-handlers/create-items-inventory.command-handler';
import { CreateItemsCommand } from './application/commands/create-items-inventory.command';
import { OrderItemsInternalService } from './application/order-item.internal';
import { OrderItemsRepository } from './infrastructure/order-item.repository';

export function createOrderItemsModule() {
  const unitOfWork = new UnitOfWork();
  const itemsRepo = new OrderItemsRepository(unitOfWork);
  const orderItemsInternalService = new OrderItemsInternalService(itemsRepo, eventBus);
  commandBus.register(CreateItemsCommand.name, new CreateItemsHandler(orderItemsInternalService));
}
