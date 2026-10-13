import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id, type Quantity } from '../../../value-objects';

export class InventoryCompletedEvent
  implements IEvent<{ inventoryId: Id; variantId: Id; quantity: Quantity }>
{
  readonly type = 'inventory.completed';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { inventoryId: Id; variantId: Id; quantity: Quantity }) {}
}
