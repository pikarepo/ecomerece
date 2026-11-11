import type { VendorReadModel } from '@ecomerece/domain';
import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';

export class EnsureActiveVendorGetByIdQuery
  implements IQuery<{ vendor: VendorReadModel | null; active: boolean }>
{
  readonly __result?: { vendor: VendorReadModel | null; active: boolean };
  readonly type = 'EnsureActiveVendorGetByIdQuery';
  public readonly payload: { vendorId: Id };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ vendorId: Id }];
    this.payload = payload;
  }
}

export class VerifyVendorAndGetQuery
  implements
    IQuery<{
      validIds: Id[];
      notFoundIds: Id[];
      deletedIds: Id[];
      nonVerifiedIds: Id[];
      vendorReadModel: VendorReadModel[];
    }>
{
  readonly __result?: {
    validIds: Id[];
    notFoundIds: Id[];
    deletedIds: Id[];
    nonVerifiedIds: Id[];
    vendorReadModel: VendorReadModel[];
  };
  readonly type = 'VerifyVendorAndGetQuery';
  public readonly payload: { ids: Id[] };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ ids: Id[] }];
    this.payload = payload;
  }
}

export class GetVendorByUserIdQuery implements IQuery<VendorReadModel | null> {
  readonly __result?: VendorReadModel | null;
  readonly type = 'GetVendorByUserIdQuery';
  public readonly payload: { userId: Id };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ userId: Id }];
    this.payload = payload;
  }
}

export interface IVendorStatsProjector {
  listVendorIds(): Promise<string[]>;
  setVendorStats(vendorId: string, metrics: Record<string, number>): Promise<void>;
  applyStats(updates: { vendorId: string; metrics: Record<string, number> }[]): Promise<void>;
}
