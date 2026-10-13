import type { ICommandHandler } from '@ecomerece/domain/command/i-command-bus';
import type { CreateItemsCommand } from '../commands/create-items-inventory.command';
import type { OrderItemsInternalService } from '../order-item.internal';

export class CreateItemsHandler implements ICommandHandler<void, CreateItemsCommand> {
  constructor(private readonly itemsSvc: OrderItemsInternalService) {}

  async handle(cmd: CreateItemsCommand): Promise<void> {
    return await this.itemsSvc.createOrderItems(cmd.items);
  }
}
