import type { IOrderItemsQueries, IOrderQueries } from '@ecomerece/contracts';
import type { Buses } from '../../core/infrastructure/buses/buses';
import { ReturnsApplicationService } from './application/returns.app.service';
import { ReturnsInternalService } from './application/returns.internal.service';
import { ReturnQueryAdapter } from './infrastructure/return-query.adapter';
import { ReturnRepository } from './infrastructure/return.repository';
import { ReturnsController } from './presentation/returns.controller';

interface ReturnsModuleDeps extends Buses {
  /** The order supplies the buyer and the active check; the line supplies the vendor and quantity. */
  orderQueries: IOrderQueries;
  orderItemsQueries: IOrderItemsQueries;
}

export function createReturnsModule({
  eventBus,
  orderQueries,
  orderItemsQueries,
}: ReturnsModuleDeps) {
  const returnRepo = new ReturnRepository();
  const internalService = new ReturnsInternalService(returnRepo, orderQueries, orderItemsQueries);
  const appService = new ReturnsApplicationService(returnRepo, internalService, eventBus);
  const controller = new ReturnsController(appService);

  return {
    controller,
    queries: new ReturnQueryAdapter(internalService),
  };
}
