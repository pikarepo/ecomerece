import type { Buses } from '../../core/infrastructure/buses/buses';
import { AddressInternalService } from './application/address.app.internal.service';
import { AddressApplicationService } from './application/address.app.service';
import { GetAddressByIdQuery } from './application/queries/get-address-by-id.query';
import { GetAddressesByOwnerIdQuery } from './application/queries/get-addresses-by-owner-id.query';
import { GetAdminPaginatedAddressesQuery } from './application/queries/get-admin-paginated-addresses.query';
import { EnsureActiveAddressGetByIdQuery } from './application/queries/ensure-active-address-get-by-it.query';
import { GetAddressByIdHandler } from './application/query-handlers/get-address-by-id.query-handler';
import { GetAddressesByOwnerIdHandler } from './application/query-handlers/get-addresses-by-owner-id.query-handler';
import { GetAdminPaginatedAddressesHandler } from './application/query-handlers/get-admin-paginated-addresses.query-handler';
import { EnsureActiveAddressGetByIdQueryHandler } from './application/query-handlers/ensure-active-address-get-by-it.query-handler';
import { AddressRepository } from './infrastructure/address.repository';
import { AddressController } from './presentation/address.controller';

export function createAddressModule({ queryBus, eventBus }: Buses) {
  const addressRepo = new AddressRepository();
  const addressInternalService = new AddressInternalService(addressRepo);
  queryBus.register(
    EnsureActiveAddressGetByIdQuery,
    new EnsureActiveAddressGetByIdQueryHandler(addressInternalService),
  );
  const addressApplicationService = new AddressApplicationService(addressRepo, queryBus, eventBus);
  queryBus.register(GetAddressByIdQuery, new GetAddressByIdHandler(addressInternalService));
  queryBus.register(
    GetAddressesByOwnerIdQuery,
    new GetAddressesByOwnerIdHandler(addressInternalService),
  );
  queryBus.register(
    GetAdminPaginatedAddressesQuery,
    new GetAdminPaginatedAddressesHandler(addressApplicationService),
  );
  const addressController = new AddressController(addressApplicationService);

  return { addressController };
}
