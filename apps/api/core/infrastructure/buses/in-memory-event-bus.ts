import type { IEvent, IEventBus, IEventHandler } from '@ecomerece/domain';

export class InMemoryEventBus implements IEventBus {
  private readonly handlers = new Map<string, Set<IEventHandler<unknown>>>();

  register<T>(eventType: string, handler: IEventHandler<T>): void {
    const handlers = this.handlers.get(eventType) ?? new Set<IEventHandler<unknown>>();

    handlers.add(handler as IEventHandler<unknown>);

    this.handlers.set(eventType, handlers);
  }
  async publish<T>(eventOrEvents: IEvent<T> | IEvent<T>[]): Promise<void> {
    const events = Array.isArray(eventOrEvents) ? eventOrEvents : [eventOrEvents];

    for (const event of events) {
      const handlers = this.handlers.get(event.type);

      if (!handlers || handlers.size === 0) {
        if (process.env.EVENT_BUS_DEBUG === 'true') {
          console.warn(`[event-bus] No handlers registered for event "${event.type}"`);
        }
        continue;
      }

      const results = await Promise.allSettled(
        Array.from(handlers).map((handler) => handler.handle(event)),
      );

      for (const result of results) {
        if (result.status === 'rejected') {
          console.error(`[event-bus] Handler failed for event "${event.type}"`, result.reason);
        }
      }
    }
  }
}

const eventBus = new InMemoryEventBus();

export { eventBus };
