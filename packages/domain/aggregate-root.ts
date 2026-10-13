import type { IEvent } from './events/event-bus.interface';

export abstract class AggregateRoot {
  private readonly events: IEvent[] = [];

  protected raise(event: IEvent): void {
    this.events.push(event);
  }

  pullEvents(): IEvent[] {
    const events = [...this.events];

    this.events.length = 0;

    return events;
  }

  clearEvents(): void {
    this.events.length = 0;
  }
}
