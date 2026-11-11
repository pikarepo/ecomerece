import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { VendorAppService } from '../vendor.app.service';

export type GetMyVendorResult = Awaited<ReturnType<VendorAppService['getMyVendor']>>;

export class GetMyVendorQuery implements IQuery<GetMyVendorResult> {
  readonly __result?: GetMyVendorResult;
  readonly type = 'GetMyVendorQuery';
  public readonly payload: { actorId: Id };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ actorId: Id }];
    this.payload = payload;
  }
}
