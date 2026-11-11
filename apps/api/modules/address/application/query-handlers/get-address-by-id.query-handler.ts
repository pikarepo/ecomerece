import type { AddressInternalService } from '../address.app.internal.service';
import type {
  GetAddressByIdQuery,
  GetAddressByIdResult,
} from '../queries/get-address-by-id.query';

export class GetAddressByIdHandler {
  readonly type = 'GetAddressByIdQuery';
  constructor(private readonly internalService: AddressInternalService) {}

  async handle(query: GetAddressByIdQuery): Promise<GetAddressByIdResult> {
    return await this.internalService.getAddressById(query.payload.addressId);
  }
}
