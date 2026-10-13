import type { EffectiveDate } from '../value-objects/effective-date.vo';

export interface IEvent<T = unknown> {
  readonly type: string;
  readonly payload: T;
  readonly occurredOn: EffectiveDate;
}

export interface IEventHandler<T = unknown> {
  handle(event: IEvent<T>): Promise<void> | void;
}

export interface IEventBus {
  register<T>(eventType: string, handler: IEventHandler<T>): void;

  publish<T>(event: IEvent<T>): Promise<void>;
  publish<T>(events: IEvent<T>[]): Promise<void>;
}
