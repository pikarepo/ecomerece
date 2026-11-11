import type {
  GetAdminPaginatedVendorsQuery,
  GetAdminPaginatedVendorsResult,
} from '../queries/get-admin-paginated-vendors.query';
import type { VendorAppService } from '../vendor.app.service';

export class GetAdminPaginatedVendorsHandler {
  readonly type = 'GetAdminPaginatedVendorsQuery';
  constructor(private readonly appService: VendorAppService) {}

  async handle(
    query: GetAdminPaginatedVendorsQuery,
  ): Promise<GetAdminPaginatedVendorsResult> {
    return await this.appService.findAdminPaginatedVendors(query.payload.query);
  }
}
