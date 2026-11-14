import type {
  IProductQueries,
  IProductStockUpdater,
  IProductVariantQueries,
  IUserQueries,
  IVendorQueries,
} from '@ecomerece/contracts';
import type { Buses } from '../../core/infrastructure/buses/buses';
import { InventoryApplicationService } from './application/inventory.app.service';
import { InventoryInternalServcie } from './application/inventory.internal.service';
import { InventoryReposityory } from './infrastructure/inventory.repository';
import { InventoryReservationAdapter } from './infrastructure/inventory-reservation.adapter';
import { InventoryController } from './presentation/inventory.controller';

interface InventoryModuleDeps extends Buses {
  productStock: IProductStockUpdater;
  variantQueries: IProductVariantQueries;
  productQueries: IProductQueries;
  vendorQueries: IVendorQueries;
  userQueries: IUserQueries;
}

export function createInventoryModule({
  eventBus,
  productStock,
  variantQueries,
  productQueries,
  vendorQueries,
  userQueries,
}: InventoryModuleDeps) {
  const inventoryRepo = new InventoryReposityory();
  const inventoryInternalServcie = new InventoryInternalServcie(inventoryRepo);
  const inventoryReservation = new InventoryReservationAdapter(
    inventoryInternalServcie,
    variantQueries,
    productStock,
  );
  const inventoryApplicationService = new InventoryApplicationService(
    inventoryRepo,
    variantQueries,
    productQueries,
    vendorQueries,
    userQueries,
    eventBus,
    productStock,
  );
  const inventoryController = new InventoryController(inventoryApplicationService);

  return { inventoryController, inventoryReservation };
}
