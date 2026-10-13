import type { AddressReadModel } from '@ecomerece/domain/modules/address/read-models/address.read-models';
import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';

export class EnsureActiveAddressGetByIdQuery
  implements IQuery<{ address: AddressReadModel | null; active: boolean }>
{
  readonly __result?: { address: AddressReadModel | null; active: boolean };
  readonly type = 'EnsureActiveAddressGetByIdQuery';
  public readonly payload: { addressId: Id };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ addressId: Id }];
    this.payload = payload;
  }
}
