import type { IQuery, IQueryBus, IQueryHandler, QueryConstructor } from '@ecomerece/domain';

export class InMemoryQueryBus implements IQueryBus {
  private readonly handlers = new Map<QueryConstructor<IQuery>, IQueryHandler<IQuery, unknown>>();

  register<TQuery extends IQuery<TResult>, TResult>(
    queryClass: QueryConstructor<TQuery>,
    handler: IQueryHandler<TQuery, TResult>,
  ): void {
    if (this.handlers.has(queryClass)) {
      throw new Error(`Handler already registered for ${queryClass.name}`);
    }

    this.handlers.set(queryClass, handler as IQueryHandler<IQuery, unknown>);
  }

  async execute<TResult>(query: IQuery<TResult>): Promise<TResult> {
    const handler = this.handlers.get(query.constructor as QueryConstructor<IQuery>);

    if (!handler) {
      throw new Error(`No handler registered for ${query.constructor.name}`);
    }

    return (await handler.handle(query)) as TResult;
  }
}

const queryBus = new InMemoryQueryBus();

export { queryBus };
