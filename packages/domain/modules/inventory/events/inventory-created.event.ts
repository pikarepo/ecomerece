import type { IEvent } from '../../../events/event-bus.interface';
import { EffectiveDate, type Id } from '../../../value-objects';

export class InventoryCreatedEvent implements IEvent<{ inventoryId: Id; variantId: Id }> {
  readonly type = 'inventory.created';
  readonly occurredOn = EffectiveDate.today();

  constructor(public readonly payload: { inventoryId: Id; variantId: Id }) {}
}
