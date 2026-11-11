import type { Buses } from '../../core/infrastructure/buses/buses';
import { InventoryApplicationService } from './application/inventory.app.service';
import { InventoryInternalServcie } from './application/inventory.internal.service';
import { GetAdminPaginatedInventoryQuery } from './application/queries/get-admin-paginated-inventory.query';
import { GetInventoryByIdQuery } from './application/queries/get-inventory-by-id.query';
import { GetInventoryByVariantIdQuery } from './application/queries/get-inventory-by-variant-id.query';
import { VerifyInventoriesItemsGetQuery } from './application/queries/verify-inventories-items-get.query';
import { GetAdminPaginatedInventoryHandler } from './application/query-handlers/get-admin-paginated-inventory.query-handler';
import { GetInventoryByIdHandler } from './application/query-handlers/get-inventory-by-id.query-handler';
import { GetInventoryByVariantIdHandler } from './application/query-handlers/get-inventory-by-variant-id.query-handler';
import { VerifyInventoriesItemsGetQueryHander } from './application/query-handlers/verify-inventories-items-get.query-handler';
import { InventoryReservationAdapter } from './infrastructure/inventory-reservation.adapter';
import { InventoryReposityory } from './infrastructure/inventory.repository';
import { InventoryController } from './presentation/inventory.controller';

export function createInventoryModule({ queryBus, eventBus }: Buses) {
  const inventoryRepo = new InventoryReposityory();
  const inventoryInternalServcie = new InventoryInternalServcie(inventoryRepo);
  const inventoryReservation = new InventoryReservationAdapter(inventoryInternalServcie);
  queryBus.register(
    VerifyInventoriesItemsGetQuery,
    new VerifyInventoriesItemsGetQueryHander(inventoryInternalServcie),
  );
  const inventoryApplicationService = new InventoryApplicationService(
    inventoryRepo,
    queryBus,
    eventBus,
  );
  queryBus.register(
    GetInventoryByIdQuery,
    new GetInventoryByIdHandler(inventoryInternalServcie),
  );
  queryBus.register(
    GetInventoryByVariantIdQuery,
    new GetInventoryByVariantIdHandler(inventoryInternalServcie),
  );
  queryBus.register(
    GetAdminPaginatedInventoryQuery,
    new GetAdminPaginatedInventoryHandler(inventoryApplicationService),
  );
  const inventoryController = new InventoryController(inventoryApplicationService);

  return { inventoryController, inventoryReservation };
}
