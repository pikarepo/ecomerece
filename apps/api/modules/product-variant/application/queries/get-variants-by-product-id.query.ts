import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { productVariantApplicationService } from '../product-variant.app.service';

export type GetVariantsByProductIdResult = Awaited<
  ReturnType<productVariantApplicationService['getVarientsByProductId']>
>;

export class GetVariantsByProductIdQuery implements IQuery<GetVariantsByProductIdResult> {
  readonly __result?: GetVariantsByProductIdResult;
  readonly type = 'GetVariantsByProductIdQuery';
  public readonly payload: { productId: Id };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ productId: Id }];
    this.payload = payload;
  }
}
