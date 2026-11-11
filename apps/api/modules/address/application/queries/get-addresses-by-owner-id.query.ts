import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { AddressInternalService } from '../address.app.internal.service';

export type GetAddressesByOwnerIdResult = Awaited<
  ReturnType<AddressInternalService['getAddressesByOwnerId']>
>;

export class GetAddressesByOwnerIdQuery implements IQuery<GetAddressesByOwnerIdResult> {
  readonly __result?: GetAddressesByOwnerIdResult;
  readonly type = 'GetAddressesByOwnerIdQuery';
  public readonly payload: { ownerId: Id };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ ownerId: Id }];
    this.payload = payload;
  }
}
