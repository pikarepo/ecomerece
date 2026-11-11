import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { VendorAppService } from '../vendor.app.service';

export type GetVendorByIdResult = Awaited<ReturnType<VendorAppService['getVendorById']>>;

export class GetVendorByIdQuery implements IQuery<GetVendorByIdResult> {
  readonly __result?: GetVendorByIdResult;
  readonly type = 'GetVendorByIdQuery';
  public readonly payload: { vendorId: Id };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ vendorId: Id }];
    this.payload = payload;
  }
}
