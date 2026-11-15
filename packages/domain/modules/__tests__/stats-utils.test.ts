import { describe, expect, it } from 'bun:test';
import { emptyMetrics } from '../../shared/metrics';
import { expandToStatEvents } from '../stats/FanOut';
import { buildMongoFilter, buildStatKey } from '../stats/StatKey';
import { getISOWeek, getTimeWindows } from '../stats/TimeWindows';

const timestamp = new Date('2026-03-09T05:07:00Z');

describe('getTimeWindows', () => {
  it('derives UTC date, hour, month and ISO week', () => {
    expect(getTimeWindows(timestamp)).toEqual({
      date: '2026-03-09',
      hour: '05',
      week: '2026-W11',
      month: '2026-03',
    });
  });

  it('pads single-digit hours and days', () => {
    expect(getTimeWindows(new Date('2026-01-02T03:04:05Z'))).toMatchObject({
      date: '2026-01-02',
      hour: '03',
      month: '2026-01',
    });
  });
});

describe('getISOWeek', () => {
  it('returns the ISO week of the year with two-digit padding', () => {
    expect(getISOWeek(new Date('2026-01-01T00:00:00Z'))).toBe('2026-W01');
    expect(getISOWeek(new Date('2025-01-01T00:00:00Z'))).toBe('2025-W01');
    expect(getISOWeek(new Date('2026-03-09T00:00:00Z'))).toBe('2026-W11');
  });

  it('assigns early January to the previous ISO year when it belongs there', () => {
    expect(getISOWeek(new Date('2024-12-30T00:00:00Z'))).toBe('2025-W01');
  });

  it('supports years with 53 ISO weeks', () => {
    expect(getISOWeek(new Date('2026-12-31T12:00:00Z'))).toBe('2026-W53');
  });
});

describe('expandToStatEvents', () => {
  const input = {
    entity: { type: 'product' as const, id: 'product-1' },
    metrics: { views: 3, purchases: 1 },
    dimensions: { country: 'US', source: 'search' },
    timestamp,
  };

  it('fans one input out to every aggregation level', () => {
    const events = expandToStatEvents(input);

    expect(events.map((event) => event.aggregation)).toEqual([
      'hourly',
      'daily',
      'weekly',
      'monthly',
      'lifetime',
    ]);
    expect(events.every((event) => event.entity === input.entity)).toBe(true);
    expect(events.every((event) => event.metrics === input.metrics)).toBe(true);
  });

  it('adds the time dimensions per level and keeps slicing dimensions', () => {
    const [hourly, daily, weekly, monthly, lifetime] = expandToStatEvents(input);

    expect(hourly?.dimensions).toEqual({
      country: 'US',
      source: 'search',
      date: '2026-03-09',
      hour: '05',
    });
    expect(daily?.dimensions).toEqual({ country: 'US', source: 'search', date: '2026-03-09' });
    expect(weekly?.dimensions).toEqual({ country: 'US', source: 'search', week: '2026-W11' });
    expect(monthly?.dimensions).toEqual({ country: 'US', source: 'search', month: '2026-03' });
    expect(lifetime?.dimensions).toEqual({ country: 'US', source: 'search' });
  });

  it('uses the current time when no timestamp is supplied', () => {
    const before = getTimeWindows(new Date()).date;

    const [daily] = expandToStatEvents({ ...input, timestamp: undefined });

    expect(daily?.dimensions.date).toBe(before);
  });
});

describe('stat keys and Mongo filters', () => {
  const event = expandToStatEvents({
    entity: { type: 'product', id: 'product-1' },
    metrics: { views: 1 },
    dimensions: { country: 'US' },
    timestamp,
  })[1]!;

  it('builds a deterministic key with a fixed dimension order', () => {
    expect(buildStatKey(event)).toBe('product:product-1:daily:2026-03-09::::US::');
  });

  it('keeps keys stable for equal events and distinct across entity or level', () => {
    expect(buildStatKey({ ...event, dimensions: { ...event.dimensions } })).toBe(
      buildStatKey(event),
    );
    expect(buildStatKey({ ...event, entity: { type: 'product', id: 'product-2' } })).not.toBe(
      buildStatKey(event),
    );
    expect(buildStatKey({ ...event, aggregation: 'monthly' })).not.toBe(buildStatKey(event));
  });

  it('builds the matching Mongo filter with null for missing dimensions', () => {
    expect(buildMongoFilter(event)).toEqual({
      'entity.type': 'product',
      'entity.id': 'product-1',
      aggregation: 'daily',
      'dimensions.date': '2026-03-09',
      'dimensions.hour': null,
      'dimensions.week': null,
      'dimensions.month': null,
      'dimensions.country': 'US',
      'dimensions.platform': null,
      'dimensions.source': null,
    });
  });
});

describe('emptyMetrics', () => {
  it('returns a fresh zeroed metric object each call', () => {
    const first = emptyMetrics();
    const second = emptyMetrics();

    expect(first).toEqual(second);
    expect(first).not.toBe(second);
    expect(first.views).toBe(0);
    expect(first.refundAmount).toBe(0);
  });
});
