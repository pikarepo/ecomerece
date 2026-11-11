import type { GetMyVendorQuery, GetMyVendorResult } from '../queries/get-my-vendor.query';
import type { VendorAppService } from '../vendor.app.service';

export class GetMyVendorHandler {
  readonly type = 'GetMyVendorQuery';
  constructor(private readonly appService: VendorAppService) {}

  async handle(query: GetMyVendorQuery): Promise<GetMyVendorResult> {
    return await this.appService.getMyVendor(query.payload.actorId);
  }
}
