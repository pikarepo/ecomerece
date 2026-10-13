import type { InventoryReadModel } from '@ecomerece/domain';
import type { ICommand } from '@ecomerece/domain/command/i-command-bus';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';

export class ReserveInventoryCommand
  implements
    ICommand<{
      validIds: Id[];
      notFoundIds: Id[];
      deletedIds: Id[];
      availableStockIds: Id[];
      buyableIds: Id[];
      inventoriesReadModel: InventoryReadModel[];
    }>
{
  constructor(
    public readonly items: { variantId: Id; quantity: Quantity }[],
    public readonly actorId: Id,
  ) {}
}
