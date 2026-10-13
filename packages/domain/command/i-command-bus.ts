// 1. Marker interface — every command class implements this
export type ICommand<TResult = void> = {};

// 2. Every command handler implements this (mirror of IQueryHandler)
// TResult is declared FIRST so TCommand's constraint can reference it directly
export interface ICommandHandler<
  TResult = void,
  TCommand extends ICommand<TResult> = ICommand<TResult>,
> {
  handle(command: TCommand): Promise<TResult>;
}

// 3. The bus contract — wire this in your DI container (mirror of IQueryBus)
export interface ICommandBus {
  register(commandName: string, handler: ICommandHandler<any, any>): void;
  execute<TResult>(command: ICommand<TResult>): Promise<TResult>;
}
