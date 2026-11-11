import type { IEventBus } from '@ecomerece/domain/events/event-bus.interface';
import type { IQueryBus } from '@ecomerece/domain/query/query-bus.interface';

export interface Buses {
  queryBus: IQueryBus;
  eventBus: IEventBus;
}
