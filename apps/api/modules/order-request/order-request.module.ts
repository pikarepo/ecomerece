import type {
  IInventoryReservation,
  IOrderItemsQueries,
  IOrderItemsWriter,
  IOrderQueries,
  IOrderWriter,
  IVendorQueries,
} from '@ecomerece/contracts';
import type { IImageStoragePort } from '@ecomerece/domain';
import type { UnitOfWork } from '../../core/database/unit-of-work';
import type { Buses } from '../../core/infrastructure/buses/buses';
import { OrderRequestApplicationService } from './application/order-request.app.service';
import { OrderRequestRepository } from './infrastructure/order-request.repository';
import { OrderRequestController } from './presentation/order-request.controller';

interface OrderRequestModuleDeps extends Buses {
  orderQueries: IOrderQueries;
  orderItemsQueries: IOrderItemsQueries;
  orderItemsWriter: IOrderItemsWriter;
  orderWriter: IOrderWriter;
  inventoryReservation: IInventoryReservation;
  vendorQueries: IVendorQueries;
  imageStorage: IImageStoragePort;
  unitOfWork: UnitOfWork;
}

export function createOrderRequestModule({
  eventBus,
  orderQueries,
  orderItemsQueries,
  orderItemsWriter,
  orderWriter,
  inventoryReservation,
  vendorQueries,
  imageStorage,
  unitOfWork,
}: OrderRequestModuleDeps) {
  const requestRepo = new OrderRequestRepository();
  const applicationService = new OrderRequestApplicationService(
    requestRepo,
    orderQueries,
    orderItemsQueries,
    orderItemsWriter,
    orderWriter,
    inventoryReservation,
    vendorQueries,
    imageStorage,
    eventBus,
    unitOfWork,
  );
  const controller = new OrderRequestController(applicationService);

  return { controller };
}
