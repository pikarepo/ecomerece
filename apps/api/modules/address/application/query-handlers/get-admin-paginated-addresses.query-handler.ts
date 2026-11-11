import type { AddressApplicationService } from '../address.app.service';
import type {
  GetAdminPaginatedAddressesQuery,
  GetAdminPaginatedAddressesResult,
} from '../queries/get-admin-paginated-addresses.query';

export class GetAdminPaginatedAddressesHandler {
  readonly type = 'GetAdminPaginatedAddressesQuery';
  constructor(private readonly appService: AddressApplicationService) {}

  async handle(
    query: GetAdminPaginatedAddressesQuery,
  ): Promise<GetAdminPaginatedAddressesResult> {
    return await this.appService.findAdminPaginatedAddresses(query.payload.query);
  }
}
