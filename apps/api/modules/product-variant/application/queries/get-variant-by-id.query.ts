import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { productVariantInternalService } from '../product-varaint.internal.service';

export type GetVariantByIdResult = Awaited<
  ReturnType<productVariantInternalService['getVariantById']>
>;

export class GetVariantByIdQuery implements IQuery<GetVariantByIdResult> {
  readonly __result?: GetVariantByIdResult;
  readonly type = 'GetVariantByIdQuery';
  public readonly payload: { variantId: Id };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ variantId: Id }];
    this.payload = payload;
  }
}
