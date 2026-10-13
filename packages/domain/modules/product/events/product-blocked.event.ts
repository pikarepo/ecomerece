import type { IEvent } from '../../../events/event-bus.interface';
import { type BlockInfoVO, EffectiveDate, type Id } from '../../../value-objects';

export class ProductBlockedEvent
  implements IEvent<{ productId: Id; actorId: Id; blockInfo: BlockInfoVO }>
{
  readonly type = 'product.blocked';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { productId: Id; actorId: Id; blockInfo: BlockInfoVO }) {}
}
