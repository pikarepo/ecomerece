export type IQuery<TResult = unknown> = {
  readonly __result?: TResult;
};

export type QueryConstructor<TQuery> = new (...args: unknown[]) => TQuery;

export interface IQueryHandler<TQuery extends IQuery<TResult>, TResult> {
  handle(query: TQuery): Promise<TResult> | TResult;
}

export interface IQueryBus {
  register<TQuery extends IQuery<TResult>, TResult>(
    queryClass: QueryConstructor<TQuery>,
    handler: IQueryHandler<TQuery, TResult>,
  ): void;

  execute<TResult>(query: IQuery<TResult>): Promise<TResult>;
}
