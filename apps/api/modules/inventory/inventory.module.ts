import { commandBus } from '../../core/infrastructure/buses/in-memory-command-bus';
import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { queryBus } from '../../core/infrastructure/buses/in-memory-query-bus';
import { ReserveInventoryHandler } from './application/command-handlers/reserve-inventory.handler';
import { ReserveInventoryCommand } from './application/commands/reserve-inventory.command';
import { InventoryApplicationService } from './application/inventory.app.service';
import { InventoryInternalServcie } from './application/inventory.internal.service';
import { VerifyInventoriesItemsGetQuery } from './application/queries/verify-inventories-items-get.query';
import { VerifyInventoriesItemsGetQueryHander } from './application/query-handlers/verify-inventories-items-get.query-handler';
import { InventoryReposityory } from './infrastructure/inventory.repository';
import { InventoryController } from './presentation/inventory.controller';

export function createInventoryModule() {
  const inventoryRepo = new InventoryReposityory();
  const inventoryInternalServcie = new InventoryInternalServcie(inventoryRepo);
  queryBus.register(
    VerifyInventoriesItemsGetQuery,
    new VerifyInventoriesItemsGetQueryHander(inventoryInternalServcie),
  );
  commandBus.register(
    ReserveInventoryCommand.name,
    new ReserveInventoryHandler(inventoryInternalServcie),
  );
  const inventoryApplicationService = new InventoryApplicationService(
    inventoryRepo,
    queryBus,
    eventBus,
  );
  const inventoryController = new InventoryController(inventoryApplicationService);

  return { inventoryController };
}
