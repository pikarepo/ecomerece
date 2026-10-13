import type { InventoryReadModel } from '@ecomerece/domain';
import type { ICommandHandler } from '@ecomerece/domain/command/i-command-bus';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { ReserveInventoryCommand } from '../commands/reserve-inventory.command';
import type { InventoryInternalServcie } from '../inventory.internal.service';

type ReserveInventoryResult = {
  validIds: Id[];
  notFoundIds: Id[];
  deletedIds: Id[];
  availableStockIds: Id[];
  buyableIds: Id[];
  inventoriesReadModel: InventoryReadModel[];
};
export class ReserveInventoryHandler
  implements ICommandHandler<ReserveInventoryResult, ReserveInventoryCommand>
{
  constructor(private readonly inventorySvc: InventoryInternalServcie) {}

  async handle(cmd: ReserveInventoryCommand): Promise<ReserveInventoryResult> {
    return await this.inventorySvc.reserveInventories(cmd.items, cmd.actorId);
  }
}
