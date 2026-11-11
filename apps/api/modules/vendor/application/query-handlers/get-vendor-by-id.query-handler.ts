import type { GetVendorByIdQuery, GetVendorByIdResult } from '../queries/get-vendor-by-id.query';
import type { VendorAppService } from '../vendor.app.service';

export class GetVendorByIdHandler {
  readonly type = 'GetVendorByIdQuery';
  constructor(private readonly appService: VendorAppService) {}

  async handle(query: GetVendorByIdQuery): Promise<GetVendorByIdResult> {
    return await this.appService.getVendorById(query.payload.vendorId.value);
  }
}
