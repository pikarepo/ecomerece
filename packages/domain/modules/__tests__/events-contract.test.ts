import { describe, expect, it } from 'bun:test';
import * as domain from '@ecomerece/domain';
import { AggregateRoot } from '../../aggregate-root';
import { EffectiveDate } from '../../value-objects';

type EventCtor = new (
  payload: Record<string, unknown>,
) => {
  type: string;
  payload: unknown;
  occurredOn: EffectiveDate;
};

const exportedValues: Record<string, unknown> = domain;
const eventEntries: [string, EventCtor][] = Object.entries(exportedValues)
  .filter(([name, value]) => typeof value === 'function' && name.endsWith('Event'))
  .map(([name, value]) => [name, value as EventCtor]);

const instantiate = (Ctor: EventCtor, payload: Record<string, unknown>) => new Ctor(payload);

const prefixes = new Set(eventEntries.map(([, Ctor]) => instantiate(Ctor, {}).type.split('.')[0]));

describe('domain event catalogue', () => {
  it('exports a substantial event class for every domain module', () => {
    expect(eventEntries.length).toBeGreaterThanOrEqual(120);
    expect([...prefixes].sort()).toEqual([
      'address',
      'cart',
      'category',
      'home',
      'inventory',
      'order',
      'order-item',
      'order-request',
      'product',
      'product-variant',
      'review',
      'stats',
      'user',
      'vendor',
    ]);
  });

  it('gives every event a unique dotted type', () => {
    const types = eventEntries.map(([, Ctor]) => instantiate(Ctor, {}).type);

    expect(new Set(types).size).toBe(types.length);
  });

  it('names every event type in lowercase dot notation', () => {
    for (const [name, Ctor] of eventEntries) {
      const event = instantiate(Ctor, {});

      expect({ name, type: event.type }).toMatchObject({
        name,
        type: expect.stringMatching(/^[a-z][a-z0-9-]*(\.[a-z0-9-]+)+$/),
      });
      expect(event.type.length).toBeGreaterThan(2);
    }
  });

  it('stamps every event with a non-future effective date', () => {
    for (const [name, Ctor] of eventEntries) {
      const event = instantiate(Ctor, {});

      expect({ name, occurredOn: event.occurredOn }).toMatchObject({
        name,
        occurredOn: expect.any(EffectiveDate),
      });
      expect(event.occurredOn.value.getTime()).toBeLessThanOrEqual(Date.now());
    }
  });

  it('keeps the payload the caller passed in', () => {
    const payload = { probe: 'value', nested: { id: '123' } };

    for (const [, Ctor] of eventEntries) {
      expect(instantiate(Ctor, payload).payload).toBe(payload);
    }
  });
});

describe('AggregateRoot event buffering', () => {
  class ProbeAggregate extends AggregateRoot {
    emit(type: string): void {
      this.raise({
        type,
        payload: { type },
        occurredOn: EffectiveDate.today(),
      });
    }
  }

  it('buffers events in order and drains them on pull', () => {
    const aggregate = new ProbeAggregate();
    aggregate.emit('one');
    aggregate.emit('two');

    expect(aggregate.pullEvents().map((event) => event.type)).toEqual(['one', 'two']);
    expect(aggregate.pullEvents()).toEqual([]);
  });

  it('returns a snapshot so mutating the pulled list cannot drop buffered events', () => {
    const aggregate = new ProbeAggregate();
    aggregate.emit('one');

    const pulled = aggregate.pullEvents();
    pulled.push({ type: 'injected', payload: {}, occurredOn: EffectiveDate.today() });

    expect(pulled).toHaveLength(2);
    expect(aggregate.pullEvents()).toEqual([]);
  });

  it('clearEvents drops everything without returning it', () => {
    const aggregate = new ProbeAggregate();
    aggregate.emit('one');

    aggregate.clearEvents();

    expect(aggregate.pullEvents()).toEqual([]);
  });
});
