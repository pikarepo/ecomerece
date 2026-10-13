import type { ICommand, ICommandBus, ICommandHandler } from '@ecomerece/domain';
export class InMemoryCommandBus implements ICommandBus {
  private handlers = new Map<string, ICommandHandler<any, any>>();

  register(commandName: string, handler: ICommandHandler<any, any>): void {
    this.handlers.set(commandName, handler);
  }

  async execute<TResult>(command: ICommand<TResult>): Promise<TResult> {
    const name = command.constructor.name;
    const handler = this.handlers.get(name);
    if (!handler) {
      throw new Error(`No handler registered for command: ${name}`);
    }
    return handler.handle(command) as Promise<TResult>;
  }
}
const commandBus = new InMemoryCommandBus();

export { commandBus };
