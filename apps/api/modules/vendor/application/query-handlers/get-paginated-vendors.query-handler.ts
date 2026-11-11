import type {
  GetPaginatedVendorsQuery,
  GetPaginatedVendorsResult,
} from '../queries/get-paginated-vendors.query';
import type { VendorAppService } from '../vendor.app.service';

export class GetPaginatedVendorsHandler {
  readonly type = 'GetPaginatedVendorsQuery';
  constructor(private readonly appService: VendorAppService) {}

  async handle(query: GetPaginatedVendorsQuery): Promise<GetPaginatedVendorsResult> {
    return await this.appService.findPaginatedVendors(query.payload.query);
  }
}
