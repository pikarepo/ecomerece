import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { AddressInternalService } from '../address.app.internal.service';

export type GetAddressByIdResult = Awaited<ReturnType<AddressInternalService['getAddressById']>>;

export class GetAddressByIdQuery implements IQuery<GetAddressByIdResult> {
  readonly __result?: GetAddressByIdResult;
  readonly type = 'GetAddressByIdQuery';
  public readonly payload: { addressId: Id };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ addressId: Id }];
    this.payload = payload;
  }
}
