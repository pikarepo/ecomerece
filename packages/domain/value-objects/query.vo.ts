import { Quantity } from '../value-objects';

export type QueryDirection = 'next' | 'prev';

export type BaseQueryVOProps = {
  filter?: Record<string, unknown>;
  cursor?: string | null;
  limit?: Quantity;
  direction?: QueryDirection;
  sort?: Record<string, 1 | -1> | null;
};

export class BaseQueryVO {
  private constructor(
    private readonly _filter: Record<string, unknown>,
    private readonly _cursor: string | null,
    private readonly _limit: Quantity,
    private readonly _direction: QueryDirection,
    private readonly _sort: Record<string, 1 | -1> | null,
  ) {}

  get filter(): Record<string, unknown> {
    return this._filter;
  }
  get cursor(): string | null {
    return this._cursor;
  }
  get limit(): Quantity {
    return this._limit;
  }
  get direction(): QueryDirection {
    return this._direction;
  }
  get sort(): Record<string, 1 | -1> | null {
    return this._sort;
  }

  toPaginationParams() {
    return {
      filter: this._filter,
      ...(this._cursor ? { cursor: this._cursor } : {}),
      limit: this._limit.value,
      direction: this._direction,
      ...(this._sort ? { sort: this._sort } : {}),
    };
  }

  static create(props: BaseQueryVOProps): BaseQueryVO {
    const rawLimit = props.limit ? props.limit.value : 20;
    const clampedLimit = Math.max(1, Math.min(rawLimit, 100));

    return new BaseQueryVO(
      props.filter ?? {},
      props.cursor ?? null,
      Quantity.create(clampedLimit),
      props.direction ?? 'next',
      props.sort ?? null,
    );
  }

  static rehydrate(
    filter: Record<string, unknown>,
    cursor: string | null,
    limit: Quantity,
    direction: QueryDirection,
    sort: Record<string, 1 | -1> | null = null,
  ): BaseQueryVO {
    return new BaseQueryVO(filter, cursor, limit, direction, sort);
  }
}
