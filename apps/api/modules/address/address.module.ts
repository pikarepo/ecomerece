import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { queryBus } from '../../core/infrastructure/buses/in-memory-query-bus';
import { AddressInternalService } from './application/address.app.internal.service';
import { AddressApplicationService } from './application/address.app.service';
import { EnsureActiveAddressGetByIdQuery } from './application/queries/ensure-active-address-get-by-it.query';
import { EnsureActiveAddressGetByIdQueryHandler } from './application/query-handlers/ensure-active-address-get-by-it.query-handler';
import { AddressRepository } from './infrastructure/address.repository';
import { AddressController } from './presentation/address.controller';

export function createAddressModule() {
  const addressRepo = new AddressRepository();
  const addressInternalService = new AddressInternalService(addressRepo);
  queryBus.register(
    EnsureActiveAddressGetByIdQuery,
    new EnsureActiveAddressGetByIdQueryHandler(addressInternalService),
  );
  const addressApplicationService = new AddressApplicationService(addressRepo, queryBus, eventBus);
  const addressController = new AddressController(addressApplicationService);

  return { addressController };
}
