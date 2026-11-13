import type { IUserQueries } from '@ecomerece/contracts';
import type { Buses } from '../../core/infrastructure/buses/buses';
import { AddressInternalService } from './application/address.app.internal.service';
import { AddressApplicationService } from './application/address.app.service';
import { AddressQueryAdapter } from './infrastructure/address-query.adapter';
import { AddressRepository } from './infrastructure/address.repository';
import { AddressController } from './presentation/address.controller';

interface AddressModuleDeps extends Buses {
  userQueries: IUserQueries;
}

export function createAddressModule({ eventBus, userQueries }: AddressModuleDeps) {
  const addressRepo = new AddressRepository();
  const addressInternalService = new AddressInternalService(addressRepo);
  const addressApplicationService = new AddressApplicationService(
    addressRepo,
    userQueries,
    eventBus,
  );
  const addressController = new AddressController(addressApplicationService);
  const queries = new AddressQueryAdapter(addressInternalService);

  return { addressController, queries };
}
